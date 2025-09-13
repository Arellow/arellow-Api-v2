import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import { Kyc, KycDocumentType, KycStatus, Prisma as prisma } from "@prisma/client";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { getDataUri } from "../../../middlewares/multer";
import axios from "axios";
import bcrypt from "bcryptjs";
import { User } from "../../../types/custom";
import { deleteImage, processImage } from "../../../utils/imagesprocess";
import { mailController } from "../../../utils/nodemailer";
import { kycRejectiontMailOption } from "../../../utils/mailer";

interface IRequest {
    documentType: KycDocumentType,
    documentNumber: string
    firstname: string
    lastname: string
}



export const createKyc = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { documentNumber , firstname, lastname } = req.body as IRequest;

    try {

        const userId = req.user?.id!;

        const hashedDocumentNumber = await bcrypt.hash(documentNumber, 10);
        const maskedDocumentNumber = documentNumber.slice(-4);

        if (!firstname || !lastname) {
            return next(new InternalServerError('Update full name to continue', 400));
        }


        const kyc = await Prisma.kyc.findUnique({ where: { userId } });


        if (kyc && kyc.status == 'VERIFIED') {
            return next(new InternalServerError("Credential was verify", 403));
        }

        if (kyc && kyc.status == 'PENDING') {
            return next(new InternalServerError("Verification still in process", 403));
        }

        if (kyc && kyc.tryCount >= 3) {
            return next(new InternalServerError("Maximum verification attempts reached. Contact support.", 403));
        }


        if (!req.file) {
            return next(new InternalServerError('Invalid photo provided', 400));
        }


        const fileUri = getDataUri(req.file as any);
        if (!fileUri) {
            return next(new InternalServerError('Invalid photo provided', 400));
        }



        // Get QoreID access token
        const tokenResp = await axios.post('https://api.qoreid.com/token', {
            clientId: process.env.QORE_clientId,
            secret: process.env.QORE_secret
        });

        const accessToken = tokenResp.data?.accessToken;
        if (!accessToken) {
            const message = ['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role!)
                ? 'QoreID unavailable'
                : 'Verification failed. Try again later';

            return next(new InternalServerError(message, 400));
        }

        if (kyc) {
            await deleteImage(kyc.documentPhoto)
        }



        let documentPhoto: string;

        try {
            documentPhoto = await processImage({
                folder: "kyc_container",
                image: req.file,
                photoType: "KYC",
                type: "PHOTO"
            });

            if (!documentPhoto) {
                return next(new InternalServerError('Failed to process photo', 500));
            }
        } catch (e) {
            return next(new InternalServerError('Photo processing failed', 500));
        }


        try {

            const identityResp = await axios.post(
                `https://api.qoreid.com/v1/ng/identities/nin/${documentNumber}`,
                { firstname, lastname },
                {
                    headers: {
                        authorization: `Bearer ${accessToken}`,
                        'content-type': 'application/json'
                    }
                }
            );


            if (identityResp?.data?.status?.status === 'id_mismatch') {

                if (kyc) {
                    await Prisma.kyc.update({
                        where: { id: kyc.id },
                        data: {
                            status: "REJECTED",
                            statueText: "Mismatch",
                            documentNumber: maskedDocumentNumber,
                            documentPhoto,
                            tryCount: { increment: 1 }
                        }
                    })


                } else {
                    await Prisma.kyc.create({
                        data: {
                            userId,
                            documentType: "NIN",
                            status: "REJECTED",
                            statueText: "Mismatch",
                            documentNumber: maskedDocumentNumber,
                            documentPhoto,
                            tryCount: 1
                        }
                    })

                }

                throw new Error('id_mismatch');

            }

            const ninData = identityResp.data?.nin;




            const kycPayload = {
                userId,
                documentType: KycDocumentType.NIN,
                status: KycStatus.PENDING,
                documentNumber: maskedDocumentNumber,
                documentPhoto,
                tryCount: kyc ? undefined : 1,
                NIN: {
                    nin: hashedDocumentNumber,
                    firstname: ninData?.firstname,
                    lastname: ninData?.lastname,
                    middlename: ninData?.middlename,
                    phone: ninData?.phone,
                    gender: ninData?.gender,
                    birthdate: ninData?.birthdate,
                    photo: ninData?.photo,
                    address: ninData?.address
                }
            };


            if (kyc) {
                await Prisma.kyc.update({
                    where: { id: kyc.id },
                    data: {
                        ...kycPayload,
                        tryCount: { increment: 1 },
                    }
                });

            } else {
                await Prisma.kyc.create({ data: kycPayload });

            }


        } catch (error: any) {

            if (error.message === 'id_mismatch') {
                return next(new InternalServerError('ID mismatch, please verify your fullname and NIN', 400));
            }

            if (error.response?.statusText === 'Not Found') {


                if (kyc) {
                    await Prisma.kyc.update({
                        where: { id: kyc.id },
                        data: {
                            status: "REJECTED",
                            statueText: error.response?.data?.message,
                            documentNumber: maskedDocumentNumber,
                            documentPhoto,
                            tryCount: { increment: 1 }
                        }
                    });

                } else {
                    await Prisma.kyc.create({
                        data: {
                            userId,
                            documentType: "NIN",
                            status: "REJECTED",
                            statueText: error.response?.data?.message,
                            documentNumber: maskedDocumentNumber,
                            documentPhoto,
                            tryCount: 1
                        }
                    });
                }

                return next(new InternalServerError(error.response?.data?.message, error.response?.status));
            }

            const status = error.response?.status || 500;
            let errormessage = error.response?.data?.message || 'verification failed';

            const message = getErrorMessage(req.user!, errormessage);

            return next(new InternalServerError(message, status));

        }



        await redis.del(`kyc:*`);
        return new CustomResponse(200, true, 'Submitted', res);

    } catch (error: any) {
        const status = error.response?.status || 500;
        let errormessage = error.response?.data?.message || 'verification failed';

        const message = getErrorMessage(req.user!, errormessage);

        next(new InternalServerError(message, status));
    }
};



export const kycDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const cacheKey = `kyc:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {

        res.status(200).json({
            success: true,
            message: "successfully. from cache",
            data: JSON.parse(cached)
        });
        return
    }

    try {

        // find single
        const user = await Prisma.kyc.findUnique({
            where: { id },
            select: {
                userId: true,
                NIN: true,
                documentPhoto: true,
                status: true,
                statueText: true,
                user: {
                    select: {
                        createdAt: true,
                        phone_number: true,
                        email: true
                    }

                }
            }
        });



        if (!user) {
            return next(new InternalServerError("user request not found", 404));
        }


        await redis.set(cacheKey, JSON.stringify(user), "EX", 60);


        new CustomResponse(200, true, "successfully", res, user);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


};

export const userKycs = async (req: Request, res: Response, next: NextFunction) => {

    const {
        type,
        status,


    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const filterTime = req.query.filterTime || "this_year";

    const cacheKey = `kyc:${page}:${limit}:${search}:${type || ""}:${status || ""}:${filterTime}`;


    const now = new Date();
    let dateFilter: prisma.DateTimeFilter | undefined;

    // const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

    // Last week (previous Monday to previous Sunday)
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setSeconds(-1); // One second before current week starts

    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
    startOfLastWeek.setHours(0, 0, 0, 0);



    switch (filterTime) {
        case "this_week": {
            const startOfThisWeek = new Date(now);
            startOfThisWeek.setHours(0, 0, 0, 0);
            startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
            dateFilter = { gte: startOfThisWeek };
            break;
        }

        case "last_week": {
            const startOfThisWeek = new Date(now);
            startOfThisWeek.setHours(0, 0, 0, 0);
            startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

            const endOfLastWeek = new Date(startOfThisWeek);
            endOfLastWeek.setSeconds(-1);

            const startOfLastWeek = new Date(endOfLastWeek);
            startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
            startOfLastWeek.setHours(0, 0, 0, 0);

            dateFilter = { gte: startOfLastWeek, lte: endOfLastWeek };
            break;
        }

        case "today": {
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            dateFilter = { gte: startOfToday };
            break;
        }

        case "this_month": {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { gte: startOfMonth };
            break;
        }

        case "last_month": {
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month
            endOfLastMonth.setHours(23, 59, 59, 999);
            dateFilter = { gte: startOfLastMonth, lte: endOfLastMonth };
            break;
        }

        default:
            dateFilter = undefined;
    }


    try {

        const filters: prisma.KycWhereInput = {

            AND: [
                search
                    ? {
                        OR: [
                            { user: { fullname: { contains: search, mode: "insensitive" } } },
                        ]
                    }
                    : undefined,

                status ? { status: status as KycStatus } : undefined,
                type ? { documentType: type as KycDocumentType } : undefined,
                dateFilter ? { createdAt: dateFilter } : undefined,
            ].filter(Boolean) as prisma.KycWhereInput[]
        };

        const result = await swrCache(cacheKey, async () => {

            const [data, total, totalSubmitted, totalVerified, totalPending, totalRejected,
                totalSubmittedThisWeek, totalSubmittedLastWeek,
                totalVerifiedThisWeek, totalVerifiedLastWeek,
                totalPendingThisWeek, totalPendingLastWeek,
                totalRejectedThisWeek, totalRejectedLastWeek,
            ] = await Promise.all([
                Prisma.kyc.findMany({
                    where: filters,
                    select: {
                        id: true,
                        user: {
                            select: {
                                role: true,
                                fullname: true,
                            }
                        },
                        documentType: true,
                        createdAt: true,
                        status: true
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.kyc.count({ where: filters }),

                Prisma.kyc.count({}),
                Prisma.kyc.count({ where: { status: "VERIFIED" } }),
                Prisma.kyc.count({ where: { status: "PENDING" } }),
                Prisma.kyc.count({ where: { status: "REJECTED" } }),


                // stat calculation
                // totalSubmitted stat
                Prisma.kyc.count({
                    where: {
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),


                // totalVerified stat
                Prisma.kyc.count({
                    where: {
                        status: "VERIFIED",
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        status: "VERIFIED",
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),

                // totalPending stat
                Prisma.kyc.count({
                    where: {
                        status: "PENDING",
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        status: "PENDING",
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),

                // totalRejected stat
                Prisma.kyc.count({
                    where: {
                        status: "REJECTED",
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        status: "REJECTED",
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),



            ]);

            const totalPages = Math.ceil(total / limit);

            // const percentageThisWeek = totalSubmitted > 0 ? (totalSubmittedThisWeek / totalSubmitted) * 100 : 0;


            // total submitted
            const totalSubmittedSubmissionChange = totalSubmittedLastWeek > 0 ? ((totalSubmittedThisWeek - totalSubmittedLastWeek) / totalSubmittedLastWeek) * 100 : totalSubmittedThisWeek > 0 ? 100 : 0;
            const totalSubmittedTrend = totalSubmittedThisWeek > totalSubmittedLastWeek ? "positive" : totalSubmittedThisWeek < totalSubmittedLastWeek ? "negative" : "neutral";

            // totalVerified
            const totalVerifiedSubmissionChange = totalVerifiedLastWeek > 0 ? ((totalVerifiedThisWeek - totalVerifiedLastWeek) / totalVerifiedLastWeek) * 100 : totalVerifiedThisWeek > 0 ? 100 : 0;
            const totalVerifiedTrend = totalVerifiedThisWeek > totalVerifiedLastWeek ? "positive" : totalVerifiedThisWeek < totalVerifiedLastWeek ? "negative" : "neutral";

            // totalPending
            const totalPendingSubmissionChange = totalPendingLastWeek > 0 ? ((totalPendingThisWeek - totalPendingLastWeek) / totalPendingLastWeek) * 100 : totalPendingThisWeek > 0 ? 100 : 0;
            const totalPendingTrend = totalPendingThisWeek > totalPendingLastWeek ? "positive" : totalPendingThisWeek < totalPendingLastWeek ? "negative" : "neutral";

            // totalRejected
            const totalRejectedSubmissionChange = totalRejectedLastWeek > 0 ? ((totalRejectedThisWeek - totalRejectedLastWeek) / totalRejectedLastWeek) * 100 : totalRejectedThisWeek > 0 ? 100 : 0;
            const totalRejectedTrend = totalRejectedThisWeek > totalRejectedLastWeek ? "positive" : totalRejectedThisWeek < totalRejectedLastWeek ? "negative" : "neutral";


            return {
                data,
                stats: {
                    totalSubmitted: {
                        count: totalSubmitted,
                        percentage: Number(totalSubmittedSubmissionChange.toFixed(2)),
                        trend: totalSubmittedTrend
                    },
                    totalVerified: {
                        count: totalVerified,
                        percentage: Number(totalVerifiedSubmissionChange.toFixed(2)),
                        trend: totalVerifiedTrend

                    },
                    totalPending: {
                        count: totalPending,
                        percentage: Number(totalPendingSubmissionChange.toFixed(2)),
                        trend: totalPendingTrend
                    },
                    totalRejected: {
                        count: totalRejected,
                        percentage: Number(totalRejectedSubmissionChange.toFixed(2)),
                        trend: totalRejectedTrend
                    },
                },
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    canGoNext: page < totalPages,
                    canGoPrev: page > 1,
                },
            }
        })


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};

export const rejectKyc = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const { rejectionReason } = req.body;

    try {

        const kyc = await Prisma.kyc.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        username: true
                    }
                }
            }
        });


        if (!kyc) {
            return next(new InternalServerError("Kyc invalid", 403));
        }

        await Prisma.kyc.update({
            where: { id },
            data: {
                status: "REJECTED"
            }
        });

        // 

        const mailOptions = await kycRejectiontMailOption({
            email: kyc.user.email,
            userName: kyc.user.username,
            rejectionReason
        });


        mailController({ from: "support@arellow.com", ...mailOptions });

        await deleteMatchingKeys("kyc:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


}

export const approvedKyc = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

    try {

        const kyc = await Prisma.kyc.findUnique({
            where: { id }
        });


        if (!kyc) {
            return next(new InternalServerError("Kyc invalid", 403));
        }


        if (kyc.status == 'VERIFIED') {
            return next(new InternalServerError("Credential was verify", 403));
        }

        await Prisma.kyc.update({
            where: { id },
            data: {
                status: "VERIFIED",
                statueText: null,
            }
        });

        await deleteMatchingKeys("kyc:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


}



export const userDashbroad = async (req: Request, res: Response, next: NextFunction) => {
     const userId = req.user?.id!;

    // const {
    //     type,
    //     status,
    // } = req.query;

    // const page = parseInt(req.query.page as string) || 1;
    const limit =  10;
    // const skip = (page - 1) * limit;

    // const search = (req.query.search as string) || "";
    const filterTime = req.query.filterTime || "this_year";

    const cacheKey = `userdashbroad:${limit}:${filterTime}`;


    const now = new Date();
    let dateFilter: prisma.DateTimeFilter | undefined;

    // const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

    // Last week (previous Monday to previous Sunday)
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setSeconds(-1); // One second before current week starts

    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
    startOfLastWeek.setHours(0, 0, 0, 0);



    switch (filterTime) {
        case "this_week": {
            const startOfThisWeek = new Date(now);
            startOfThisWeek.setHours(0, 0, 0, 0);
            startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
            dateFilter = { gte: startOfThisWeek };
            break;
        }

        case "last_week": {
            const startOfThisWeek = new Date(now);
            startOfThisWeek.setHours(0, 0, 0, 0);
            startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

            const endOfLastWeek = new Date(startOfThisWeek);
            endOfLastWeek.setSeconds(-1);

            const startOfLastWeek = new Date(endOfLastWeek);
            startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
            startOfLastWeek.setHours(0, 0, 0, 0);

            dateFilter = { gte: startOfLastWeek, lte: endOfLastWeek };
            break;
        }

        case "today": {
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            dateFilter = { gte: startOfToday };
            break;
        }

        case "this_month": {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { gte: startOfMonth };
            break;
        }

        case "last_month": {
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month
            endOfLastMonth.setHours(23, 59, 59, 999);
            dateFilter = { gte: startOfLastMonth, lte: endOfLastMonth };
            break;
        }

        default:
            dateFilter = undefined;
    }


    try {

         const kyc = await Prisma.kyc.findUnique({
            where: { userId },
         });

        const filters: prisma.KycWhereInput = {

            AND: [
                dateFilter ? { createdAt: dateFilter } : undefined,
            ].filter(Boolean) as prisma.KycWhereInput[]
        };

        const result = await swrCache(cacheKey, async () => {

            const [propertyLocationData, totalPropertyLocationData, properties,
                data,  totalSubmitted, totalVerified, totalPending, totalRejected,
                totalSubmittedThisWeek, totalSubmittedLastWeek,
                totalVerifiedThisWeek, totalVerifiedLastWeek,
                totalPendingThisWeek, totalPendingLastWeek,
                totalRejectedThisWeek, totalRejectedLastWeek,
            ] = await Promise.all([

            Prisma.property.findMany({
                where: { userId,  archived: false },
                select: { location: true, status: true, title: true},
                orderBy: { createdAt: "desc" },
            }
          ),
            Prisma.property.count({ where: { userId, archived: false,} }),

              Prisma.property.findMany({
                // where: { userId,  archived: false },
                select: {title: true, id: true, viewsCount: true, sharesCount: true, status: true, createdAt: true },
                orderBy: { createdAt: "desc" },
                take: limit
            }
          ),





                Prisma.kyc.findMany({
                    where: filters,
                    select: {
                        id: true,
                        user: {
                            select: {
                                role: true,
                                fullname: true,
                            }
                        },
                        documentType: true,
                        createdAt: true,
                        status: true
                    },
                    // skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
         

                Prisma.kyc.count({}),
                Prisma.kyc.count({ where: { status: "VERIFIED" } }),
                Prisma.kyc.count({ where: { status: "PENDING" } }),
                Prisma.kyc.count({ where: { status: "REJECTED" } }),


                // stat calculation
                // totalSubmitted stat
                Prisma.kyc.count({
                    where: {
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),


                // totalVerified stat
                Prisma.kyc.count({
                    where: {
                        status: "VERIFIED",
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        status: "VERIFIED",
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),

                // totalPending stat
                Prisma.kyc.count({
                    where: {
                        status: "PENDING",
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        status: "PENDING",
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),

                // totalRejected stat
                Prisma.kyc.count({
                    where: {
                        status: "REJECTED",
                        createdAt: {
                            gte: startOfThisWeek,
                        },
                    },
                }),
                Prisma.kyc.count({
                    where: {
                        status: "REJECTED",
                        createdAt: {
                            gte: startOfLastWeek,
                            lte: endOfLastWeek,
                        },
                    },
                }),



            ]);

            // total submitted
            const totalSubmittedSubmissionChange = totalSubmittedLastWeek > 0 ? ((totalSubmittedThisWeek - totalSubmittedLastWeek) / totalSubmittedLastWeek) * 100 : totalSubmittedThisWeek > 0 ? 100 : 0;
            const totalSubmittedTrend = totalSubmittedThisWeek > totalSubmittedLastWeek ? "positive" : totalSubmittedThisWeek < totalSubmittedLastWeek ? "negative" : "neutral";

            // totalVerified
            const totalVerifiedSubmissionChange = totalVerifiedLastWeek > 0 ? ((totalVerifiedThisWeek - totalVerifiedLastWeek) / totalVerifiedLastWeek) * 100 : totalVerifiedThisWeek > 0 ? 100 : 0;
            const totalVerifiedTrend = totalVerifiedThisWeek > totalVerifiedLastWeek ? "positive" : totalVerifiedThisWeek < totalVerifiedLastWeek ? "negative" : "neutral";

            // totalPending
            const totalPendingSubmissionChange = totalPendingLastWeek > 0 ? ((totalPendingThisWeek - totalPendingLastWeek) / totalPendingLastWeek) * 100 : totalPendingThisWeek > 0 ? 100 : 0;
            const totalPendingTrend = totalPendingThisWeek > totalPendingLastWeek ? "positive" : totalPendingThisWeek < totalPendingLastWeek ? "negative" : "neutral";

            // totalRejected
            const totalRejectedSubmissionChange = totalRejectedLastWeek > 0 ? ((totalRejectedThisWeek - totalRejectedLastWeek) / totalRejectedLastWeek) * 100 : totalRejectedThisWeek > 0 ? 100 : 0;
            const totalRejectedTrend = totalRejectedThisWeek > totalRejectedLastWeek ? "positive" : totalRejectedThisWeek < totalRejectedLastWeek ? "negative" : "neutral";



            const AllProperties = properties.map(property => {
                return {
                    slug: `#Arw-${property.id.slice(-3)}`,
                    performance: {
                        percentage: 0,
                        trend: "neutral"

                    },
                    ...property
                }
            })

            return {
                properties: AllProperties,
                // data,
                stats: {
                    totalSubmitted: {
                        count: totalSubmitted,
                        percentage: Number(totalSubmittedSubmissionChange.toFixed(2)),
                        trend: totalSubmittedTrend
                    },
                    totalVerified: {
                        count: totalVerified,
                        percentage: Number(totalVerifiedSubmissionChange.toFixed(2)),
                        trend: totalVerifiedTrend

                    },
                    totalPending: {
                        count: totalPending,
                        percentage: Number(totalPendingSubmissionChange.toFixed(2)),
                        trend: totalPendingTrend
                    },
                    totalRejected: {
                        count: totalRejected,
                        percentage: Number(totalRejectedSubmissionChange.toFixed(2)),
                        trend: totalRejectedTrend
                    },
                },
                kycStatus: kyc?.status || "UNVERIFIED",
                reward: {
                    totalEarning: 0,
                    soldEarning: 0,
                    uploadPropertyEarning: 0,
                    withdrawableEarning: 0,
                },
                propertyLocations : {
                    locations: propertyLocationData,
                    totalProperty: totalPropertyLocationData

                }

               
            }
        })


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};



const getErrorMessage = (user: User, fallback: string) => {
    return ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? fallback : 'Verification failed';
}





// async function getUserPointsTimeline(userId, rewardsPage = 1, rewardsLimit = 10, requestsPage = 1, requestsLimit = 10) {
//   // Fetch paginated reward history
//   const rewards = await prisma.rewardHistory.findMany({
//     where: { userId },
//     orderBy: { createdAt: 'desc' },
//     skip: (rewardsPage - 1) * rewardsLimit,
//     take: rewardsLimit,
//     include: { property: { select: { title: true } } }
//   });

//   // Fetch paginated withdrawal requests
//   const withdrawals = await prisma.rewardRequest.findMany({
//     where: { userId },
//     orderBy: { createdAt: 'desc' },
//     skip: (requestsPage - 1) * requestsLimit,
//     take: requestsLimit,
//   });

//   // Map both to a unified format
//   const rewardItems = rewards.map(r => ({
//     id: r.id,
//     type: 'reward',
//     points: r.points,
//     reason: r.reason,
//     description: r.description,
//     propertyTitle: r.property?.title || null,
//     status: null,
//     createdAt: r.createdAt,
//   }));

//   const withdrawalItems = withdrawals.map(w => ({
//     id: w.id,
//     type: 'withdrawal',
//     points: -w.totalPoints,
//     reason: 'Points withdrawal',
//     description: null,
//     propertyTitle: null,
//     status: w.status,
//     createdAt: w.createdAt,
//   }));

//   // Combine and sort by createdAt descending
//   const combined = [...rewardItems, ...withdrawalItems].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

//   return combined;
// }


// const rewardsCount = await prisma.rewardHistory.count({ where: { userId } });
// const withdrawalsCount = await prisma.rewardRequest.count({ where: { userId } });


// async function rewardUser(userId, points, type, reason, propertyId = null, description = null) {
//   // Validate inputs, e.g., points > 0, valid type, user exists etc.

//   const reward = await prisma.rewardHistory.create({
//     data: {
//       userId,
//       points,
//       type,          // "SOLD" or "UPLOAD"
//       reason,        // e.g., "Property sold bonus"
//       description,
//       propertyId,    // optional, if reward is related to a property
//     }
//   });

//   return reward;
// }



// async function createWithdrawalRequestFull(userId, requestedPoints) {
//   const remainingPoints = await getRemainingPoints(userId);
//   if (requestedPoints > remainingPoints) {
//     throw new Error('Insufficient points');
//   }

//   // Create request
//   const withdrawalRequest = await prisma.rewardRequest.create({
//     data: {
//       userId,
//       totalPoints: requestedPoints,
//       status: 'PENDING'
//     }
//   });

//   // Allocate points across reward history
//   await allocatePointsForWithdrawal(userId, requestedPoints, withdrawalRequest.id);

//   return withdrawalRequest;
// }


// async function getRemainingPoints(userId: string): Promise<number> {
//   // Sum total earned points
//   const earnedResult = await prisma.rewardHistory.aggregate({
//     where: { userId },
//     _sum: { points: true },
//   });

//   // Sum total approved withdrawn points
//   const withdrawnResult = await prisma.rewardRequest.aggregate({
//     where: {
//       userId,
//       status: 'APPROVED',
//     },
//     _sum: { totalPoints: true },
//   });

//   const totalEarned = earnedResult._sum.points ?? 0;
//   const totalWithdrawn = withdrawnResult._sum.totalPoints ?? 0;

//   const remaining = totalEarned - totalWithdrawn;

//   // Ensure no negative balance
//   return remaining >= 0 ? remaining : 0;
// }


// async function allocatePointsForWithdrawal(userId, requestedPoints, rewardRequestId) {
//   let pointsLeft = requestedPoints;

//   // Fetch reward histories with available points
//   const rewards = await prisma.$queryRaw`
//     SELECT rh.id, rh.points - COALESCE(SUM(rri.claimedPoints), 0) as availablePoints
//     FROM RewardHistory rh
//     LEFT JOIN RewardRequestItem rri ON rh.id = rri.rewardHistoryId
//     WHERE rh.userId = ${userId}
//     GROUP BY rh.id, rh.points
//     HAVING availablePoints > 0
//     ORDER BY rh.createdAt ASC
//   `;

//   for (const reward of rewards) {
//     if (pointsLeft <= 0) break;

//     const claim = Math.min(reward.availablePoints, pointsLeft);

//     await prisma.rewardRequestItem.create({
//       data: {
//         rewardRequestId,
//         rewardHistoryId: reward.id,
//         claimedPoints: claim
//       }
//     });

//     pointsLeft -= claim;
//   }

//   if (pointsLeft > 0) {
//     throw new Error('Not enough unclaimed points to allocate');
//   }
// }



// import express from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// const adminRouter = express.Router();

// // Middleware example to check admin auth (simple stub)
// function isAdmin(req, res, next) {
//   // TODO: implement real admin auth here
//   if (req.headers['x-admin-token'] === 'secret-admin-token') {
//     next();
//   } else {
//     res.status(403).json({ error: 'Unauthorized' });
//   }
// }

// adminRouter.use(isAdmin);

// // List withdrawal requests with pagination & filter by status
// adminRouter.get('/withdrawals', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 20;
//     const status = req.query.status as string | undefined;

//     const whereClause = status ? { status } : {};

//     const [requests, total] = await Promise.all([
//       prisma.rewardRequest.findMany({
//         where: whereClause,
//         orderBy: { createdAt: 'desc' },
//         skip: (page - 1) * limit,
//         take: limit,
//         include: {
//           user: { select: { id: true, email: true } },
//           items: {
//             include: {
//               rewardHistory: { select: { reason: true, description: true } }
//             }
//           }
//         }
//       }),
//       prisma.rewardRequest.count({ where: whereClause }),
//     ]);

//     res.json({
//       data: requests,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Approve a withdrawal request
// adminRouter.post('/withdrawals/:id/approve', async (req, res) => {
//   try {
//     const requestId = req.params.id;

//     const request = await prisma.rewardRequest.findUnique({ where: { id: requestId } });
//     if (!request) return res.status(404).json({ error: 'Request not found' });
//     if (request.status !== 'PENDING') return res.status(400).json({ error: 'Request already processed' });

//     const updatedRequest = await prisma.rewardRequest.update({
//       where: { id: requestId },
//       data: { status: 'APPROVED', processedAt: new Date() },
//     });

//     // Optional: Notify user here (email, websocket, etc.)

//     res.json({ success: true, data: updatedRequest });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Reject a withdrawal request
// adminRouter.post('/withdrawals/:id/reject', async (req, res) => {
//   try {
//     const requestId = req.params.id;
//     const { reason } = req.body;

//     const request = await prisma.rewardRequest.findUnique({ where: { id: requestId } });
//     if (!request) return res.status(404).json({ error: 'Request not found' });
//     if (request.status !== 'PENDING') return res.status(400).json({ error: 'Request already processed' });

//     const updatedRequest = await prisma.rewardRequest.update({
//       where: { id: requestId },
//       data: {
//         status: 'REJECTED',
//         processedAt: new Date(),
//         // optionally, store rejection reason somewhere (add a column if needed)
//       },
//     });

//     // Optional: Notify user with rejection reason here

//     res.json({ success: true, data: updatedRequest });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default adminRouter;
