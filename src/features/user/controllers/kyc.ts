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

        const kyc = await Prisma.kyc.findUnique({
            where: { userId }
        });


        if (kyc && kyc.status == 'VERIFIED') {
            return next(new InternalServerError("Credential was verify", 403));
        }

        if (kyc && kyc.status == 'PENDING') {
            return next(new InternalServerError("Verification still in process", 403));
        }


        if (kyc && kyc.tryCount === 3) {
            return next(new InternalServerError("Maximum verification reach contact support", 403));
        }


        if (!req.file) {
            return next(new InternalServerError('Face recognition is required', 401));
        }


        const fileUri = getDataUri(req.file as any);
        if (!fileUri) {
            return next(new InternalServerError('Invalid photo provided', 400));
        }

        const base64 = fileUri.content.split(',')[1];

        if (!base64) {
            return next(new InternalServerError('Invalid photo provided', 400));
        }

        if (kyc) {
            // allso delete avatar
            await Prisma.kyc.deleteMany({
                where: { userId }
            });
        }


        const documentPhoto = fileUri;

        const tokenOptions = {
            method: 'POST',
            url: 'https://api.qoreid.com/token',
            headers: { accept: 'text/plain', 'content-type': 'application/json' },
            data: { clientId: process.env.QORE_clientId, secret: process.env.QORE_secret }
        };

        const getToken = await axios.request(tokenOptions);

        if (!getToken.data.accessToken) {
            return next(new InternalServerError('This service is not available at the moment try again later.', 400));
        }

        let fullName;

        if (!req.user?.fullname) {
            return next(new InternalServerError('update fullname to continue', 400));
        }

        fullName = req.user?.fullname.split(" ");

        const hasheddocumentNumber = await bcrypt.hash(documentNumber, 10);


        const optionsKyc = {
            method: 'POST',
            url: `https://api.qoreid.com/v1/ng/identities/nin/${documentNumber}`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: `Bearer ${getToken.data.accessToken}`
            },
            data: { firstname: fullName[0], lastname: fullName[1] }
        };

        axios.request(optionsKyc).then(async (result) => {

            const hashednin = await bcrypt.hash(result.data.nin.nin, 10);

            console.log({ response: result.data })

            //      const keyReponse = await Prisma.kyc.create({
            //     data: {
            //         userId,
            //         documentType: "NIN",
            //         status: "PENDING",
            //         NIN: {
            //             nin: hashednin,
            //             firstname: result.nin.firstname,
            //             lastname: result.nin.lastname,
            //             middlename: result.nin.middlename,
            //             phone: result.nin.phone,
            //             gender: result.nin.gender,
            //             birthdate: result.nin.birthdate,
            //             photo: result.nin.photo,
            //             address: result.nin.address
            //         },
            //         documentNumber: hasheddocumentNumber,
            //         documentPhoto: documentPhoto.content
            //     }
            // })

            // // Increment trying count
            // await Prisma.kyc.update({
            //     where: { id: keyReponse.id },
            //     data: { tryCount: { increment: 1 } },
            // });

        }).catch(async (error) => {

            const keyReponse = await Prisma.kyc.create({
                data: {
                    userId,
                    documentType: "NIN",
                    status: "PENDING",
                    statueText: error.response?.data?.message,
                    documentNumber: hasheddocumentNumber,
                    documentPhoto: documentPhoto.content
                }
            })

            // Increment trying count
            await Prisma.kyc.update({
                where: { id: keyReponse.id },
                data: { tryCount: { increment: 1 } },
            });

        });

        await redis.del(`kyc:*`);
        return new CustomResponse(200, true, 'Submitted', res);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message || 'Face verification failed';
        return next(new InternalServerError(message, status));
    }
};



export const kycDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const cacheKey = `kyc:${id}`;

    const cached = await redis.get(cacheKey);
    // if (cached) {

    //     res.status(200).json({
    //         success: true,
    //         message: "successfully. from cache",
    //         data: JSON.parse(cached)
    //     });
    //     return
    // }

    try {

        // find single
        const user = await Prisma.kyc.findUnique({
            where: { id }
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

    const cacheKey = `kyc:${page}:${limit}:${search}:${type || ""}:${status || ""}`;


    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

    // Last week (previous Monday to previous Sunday)
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setSeconds(-1); // One second before current week starts

    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
    startOfLastWeek.setHours(0, 0, 0, 0);


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
            ].filter(Boolean) as prisma.KycWhereInput[]
        };

        const result = await swrCache(cacheKey, async () => {

            const [data, total, totalSubmitted, totalVerified, totalPending, totalRejected, totalSubmittedThisWeek, totalSubmittedLastWeek] = await Promise.all([
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

            ]);

            const totalPages = Math.ceil(total / limit);

            // const percentageThisWeek = totalSubmitted > 0 ? (totalSubmittedThisWeek / totalSubmitted) * 100 : 0;

const totalSubmittedSubmissionChange = totalSubmittedLastWeek > 0 ? ((totalSubmittedThisWeek - totalSubmittedLastWeek) / totalSubmittedLastWeek) * 100 : totalSubmittedThisWeek > 0 ? 100 : 0;

const totalSubmittedTrend = totalSubmittedThisWeek > totalSubmittedLastWeek ? "positive" : totalSubmittedThisWeek < totalSubmittedLastWeek ? "negative" : "neutral";


            return {
                data,
                stats: {
                    totalSubmitted: {
                        totalSubmitted,
                        percentage: Number(totalSubmittedSubmissionChange.toFixed(4)),
                        trend: totalSubmittedTrend
                    },
                    totalVerified: {
                        totalVerified
                    },
                    totalPending: {
                        totalPending
                    },
                    totalRejected: {
                        totalRejected
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

export const changeKycStatus = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const { status } = req.body;

    try {

        const kyc = await Prisma.kyc.findUnique({
            where: { id }
        });


        if (!kyc) {
            return next(new InternalServerError("Kyc invalid", 403));
        }


        if (status == 'VERIFIED') {
            // return next(new InternalServerError("Credential was verify", 403));
        }

        if (status == 'FAILED') {
            // return next(new InternalServerError("Verification still in process", 403));
        }

        await Prisma.kyc.update({
            where: { id },
            data: {
                status
            }
        });

        await deleteMatchingKeys("kyc:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


}


// function getValidCategory(value: string): KycStatus | null {
//   const lowerValue = value.toLowerCase();
//   return (
//     Object.values(KycStatus).find(
//       (category) => category.toLowerCase().includes(lowerValue)
//     ) ?? null
//   );
// }