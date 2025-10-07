import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { getDateRange } from "../../../utils/getDateRange";
import { calculateTrend } from "../../../utils/calculateTrend";
import { Prisma as prisma } from '@prisma/client';

export const rewardDashbroad = async (req: Request, res: Response, next: NextFunction) => {


    const limit = 10;
    const filterTime = req.query.filterTime || "this_year";

    const cacheKey = `rewarddashbroad:${limit}:${filterTime}`;

    const { current, previous } = getDateRange(filterTime.toString());


    try {

        const result = await swrCache(cacheKey, async () => {

            const [

                // property
                currentPointEarn,
                previousPointEarn,

                withdrewCurrent,
                withdrewPrevious,

                pendingWithdrawaRequestCurrent,
                pendingWithdrawaRequestPrevious,

            ] = await Promise.all([


                //   rewardHistory
                Prisma.rewardHistory.count({ where: { type: "CREDIT", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.rewardHistory.count({ where: { type: "CREDIT", createdAt: { gte: previous.start, lte: previous.end } } }),


                Prisma.rewardHistory.count({ where: { type: "DEBIT", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.rewardHistory.count({ where: { type: "DEBIT", createdAt: { gte: previous.start, lte: previous.end } } }),


                Prisma.rewardRequest.count({ where: { status: "PENDING", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.rewardRequest.count({ where: { status: "PENDING", createdAt: { gte: previous.start, lte: previous.end } } }),

                //  Prisma.rewardRequest.findMany({
                //     where: { userId },
                // }),

                //  Prisma.rewardHistory.findMany({
                //     where: { userId },
                //     select: {
                //         id: true,
                //         points: true,
                //         type: true,
                //         createdAt: true
                //     }
                // }),


            ]);


            const earnStats = calculateTrend(currentPointEarn, previousPointEarn);
            const withdrewStats = calculateTrend(withdrewCurrent, withdrewPrevious);

            const pendingWithdrawaRequestStats = calculateTrend(pendingWithdrawaRequestCurrent, pendingWithdrawaRequestPrevious);



            // const totalEarning = rewards.reduce((v, c) => {

            //     if (c.type == "CREDIT") {
            //         v.CREDIT += c.points;
            //     }

            //     if (c.type == "DEBIT") {
            //         v.DEBIT += c.points;
            //     }

            //     return v;
            // }, { CREDIT: 0, DEBIT: 0 });

            // let withdrawableEarning = 0;
            // const difference = totalEarning.CREDIT - totalEarning.DEBIT;

            // if (totalEarning.DEBIT > totalEarning.CREDIT) {
            //     withdrawableEarning = 0;
            // } else if (difference >= 200) {
            //     withdrawableEarning = difference - 200;
            // } else {
            //     withdrawableEarning = 0;
            // }

            return {

                stats: {

                    pointEarns: {
                        count: currentPointEarn,
                        percentage: earnStats.percentage,
                        trend: earnStats.trend
                    },
                    withdrawalEarns: {
                        count: withdrewCurrent,
                        percentage: withdrewStats.percentage,
                        trend: withdrewStats.trend
                    },


                    pendingWithdrawaRequest: {
                        count: pendingWithdrawaRequestCurrent,
                        percentage: pendingWithdrawaRequestStats.percentage,
                        trend: pendingWithdrawaRequestStats.trend
                    }
                }

            }
        })


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};



export const rewardRequest = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const {
            search,
            page = "1",
            limit = "10"
        } = req.query;


        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const cacheKey = `rewardRequest:${JSON.stringify(req.query)}`;

        const filters: prisma.RewardRequestWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            {
                                user: {
                                    fullname: { contains: search as string, mode: 'insensitive' }
                                }
                            },
                        ]
                    }
                    : undefined,

            ].filter(Boolean) as prisma.RewardRequestWhereInput[]
        };


        const result = await swrCache(cacheKey, async () => {
            const [properties, total] = await Promise.all([
                Prisma.rewardRequest.findMany({
                    where: filters,
                    include: {

                        user: {
                            select: {
                                avatar: true,
                                fullname: true,

                            }
                        }
                    },
                    orderBy: { createdAt: "desc" },
                    skip: (pageNumber - 1) * pageSize,
                    take: pageSize
                }),
                Prisma.rewardRequest.count({ where: filters })
            ]);

            const totalPages = Math.ceil(total / pageSize);
            const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
            const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

            return {
                data: properties,
                pagination: {
                    total,
                    page: pageNumber,
                    pageSize,
                    totalPages,
                    nextPage,
                    prevPage,
                    canGoNext: pageNumber < totalPages,
                    canGoPrev: pageNumber > 1
                }
            };
        });

        new CustomResponse(200, true, "success", res, result);



    } catch (error) {
        next(new InternalServerError("Server Error", 500));
    }

};


export const rewardHistory = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const {
            search,
            page = "1",
            limit = "10"
        } = req.query;


        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const cacheKey = `rewardHistory:${JSON.stringify(req.query)}`;

        const filters: prisma.RewardHistoryWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            {
                                user: {
                                    fullname: { contains: search as string, mode: 'insensitive' }
                                }
                            },

                        ]
                    }
                    : undefined,

            ].filter(Boolean) as prisma.RewardHistoryWhereInput[]
        };


        const result = await swrCache(cacheKey, async () => {
            const [properties, total] = await Promise.all([
                Prisma.rewardHistory.findMany({
                    where: filters,
                    include: {

                        user: {
                            select: {
                                avatar: true,
                                fullname: true,

                            }
                        }
                    },
                    orderBy: { createdAt: "desc" },
                    skip: (pageNumber - 1) * pageSize,
                    take: pageSize
                }),
                Prisma.rewardHistory.count({ where: filters })
            ]);

            const totalPages = Math.ceil(total / pageSize);
            const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
            const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

            return {
                data: properties,
                pagination: {
                    total,
                    page: pageNumber,
                    pageSize,
                    totalPages,
                    nextPage,
                    prevPage,
                    canGoNext: pageNumber < totalPages,
                    canGoPrev: pageNumber > 1
                }
            };
        });

        new CustomResponse(200, true, "success", res, result);



    } catch (error) {
        next(new InternalServerError("Server Error", 500));
    }

};




export const getRewardHistoryDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const cacheKey = `rewardHistoryDetail:${id}`;


    try {

        const rewardHistory = await Prisma.rewardHistory.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        avatar: true,
                        fullname: true,
                        phone_number: true,
                        email: true,
                        lastSeen: true,
                        online: true,
                        is_verified: true,
                        kyc: {
                            select: { status: true }
                        }
                    }
                }
            }
        })


        if (!rewardHistory) {
            return next(new InternalServerError("rewardHistory not found", 404));
        }



        const result = await swrCache(cacheKey, async () => {

            const [
                //property locations
                AllRewardHistory, AllRewardRequest,




            ] = await Promise.all([


                Prisma.rewardHistory.findMany({
                    where: { userId: rewardHistory?.userId },
                }),

                Prisma.rewardRequest.findMany({
                    where: { userId: rewardHistory?.userId },
                }),



            ]);



            const totalEarning = AllRewardHistory.reduce((v, c) => {

                if (c.type == "CREDIT") {
                    v.totalPointEarn += c.points;
                }

                if (c.type == "DEBIT") {
                    v.totalPointWithdraw += c.points;
                }

                return v;
            }, { totalPointEarn: 0, totalPointWithdraw: 0 });

            return {
                totalEarning, AllRewardHistory, AllRewardRequest, rewardHistory
            }
        })


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};


export const getRewardRequestDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const cacheKey = `rewardRequestDetail:${id}`;


    try {

        const rewardHistory = await Prisma.rewardRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        avatar: true,
                        fullname: true,
                        phone_number: true,
                        email: true,
                        lastSeen: true,
                        online: true,
                        is_verified: true,
                        kyc: {
                            select: { status: true }
                        }
                    }
                }
            }
        })


        if (!rewardHistory) {
            return next(new InternalServerError("rewardHistory not found", 404));
        }



        const result = await swrCache(cacheKey, async () => {

            const [
                //property locations
                AllRewardHistory, AllRewardRequest,




            ] = await Promise.all([


                Prisma.rewardHistory.findMany({
                    where: { userId: rewardHistory?.userId },
                }),

                Prisma.rewardRequest.findMany({
                    where: { userId: rewardHistory?.userId },
                }),



            ]);



            const totalEarning = AllRewardHistory.reduce((v, c) => {

                if (c.type == "CREDIT") {
                    v.totalPointEarn += c.points;
                }

                if (c.type == "DEBIT") {
                    v.totalPointWithdraw += c.points;
                }

                return v;
            }, { totalPointEarn: 0, totalPointWithdraw: 0 });

            return {
                totalEarning, AllRewardHistory, AllRewardRequest, rewardHistory
            }
        })


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};




export const rewardStatus = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

    const {status} = req.body;

    try {

        const rewardRequest = await Prisma.rewardRequest.findUnique({
            where: { id }
        });


        if (!rewardRequest) {
            return next(new InternalServerError("Reward Request is invalid", 403));
        }


        if (rewardRequest.status == 'APPROVED') {
            return next(new InternalServerError("Reward was verify", 403));
        }


     

         if (status == 'APPROVED') {
             const rewards = await  Prisma.rewardHistory.findMany({
                                 where: { userId: rewardRequest.userId },
                                 select: {
                                     id: true,
                                     points: true,
                                     type: true,
                                     reason: true,
                                     createdAt: true
                                 }
                             })
     
     
     
     
     
                const totalEarning = rewards.reduce((v, c) => {
     
                     if (c.type == "CREDIT") {
                         v.CREDIT += c.points;
                     }
     
                     if (c.type == "DEBIT") {
                         v.DEBIT += c.points;
                     }
     
                     return v;
                 }, { CREDIT: 0, DEBIT: 0 });
     
                 let withdrawableEarning = 0;
                 const difference = totalEarning.CREDIT - totalEarning.DEBIT;
     
                 if (totalEarning.DEBIT > totalEarning.CREDIT) {
                     withdrawableEarning = 0;
                 } else if (difference >= 200) {
                     withdrawableEarning = difference - 200;
                 } else {
                     withdrawableEarning = 0;
                 }
     
     
                 if(rewardRequest.requestPoints > withdrawableEarning ){
                      return next(new InternalServerError("Not enough point for this process", 403));
                 }
     
     
         await Prisma.rewardHistory.create({
           data: {
             userId: rewardRequest.userId,
             points: rewardRequest.requestPoints,
             reason: "Points Withdrawal",
             type: "DEBIT"
           }
         })
     
     
     
             await Prisma.rewardRequest.update({
                 where: { id },
                 data: {
                     status: "APPROVED",
                 }
             });
            
         }


             if (status == 'REJECTED') {

                 await Prisma.rewardRequest.update({
                 where: { id },
                 data: {
                     status: "REJECTED",
                 }
             });
            
         }


        await deleteMatchingKeys("rewarddashbroad:*");
        await deleteMatchingKeys("rewardRequestDetail:*");
        await deleteMatchingKeys("rewardHistoryDetail:*");
        await deleteMatchingKeys("rewardHistory:*");
        await deleteMatchingKeys("rewardRequest:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Operation failed", 500));
    }

}