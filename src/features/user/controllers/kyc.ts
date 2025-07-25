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

}



export const createKyc = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { documentNumber } = req.body as IRequest;

    try {

        const userId = req.user?.id!;
        const fullName = req.user?.fullname?.trim().split(' ');

        const hashedDocumentNumber = await bcrypt.hash(documentNumber, 10);
        const maskedDocumentNumber = documentNumber.slice(-4);

        if (!fullName || fullName.length < 2) {
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
                { firstname: fullName[0], lastname: fullName[1] },
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
    const filterTime = req.query.filterTime || "";

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



const getErrorMessage = (user: User, fallback: string) => {
    return ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? fallback : 'Verification failed';
}