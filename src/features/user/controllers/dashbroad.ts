import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import { Prisma as prisma } from "@prisma/client";
import { swrCache } from "../../../lib/cache";
// import { getDataUri } from "../../../middlewares/multer";
// import axios from "axios";
// import bcrypt from "bcryptjs";
// import { User } from "../../../types/custom";
// import { deleteImage, processImage } from "../../../utils/imagesprocess";
// import { mailController } from "../../../utils/nodemailer";
// import { kycRejectiontMailOption } from "../../../utils/mailer";

export const userDashbroad = async (req: Request, res: Response, next: NextFunction) => {
     const userId = req.user?.id!;

    const limit =  10;
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

        //  const kyc = await Prisma.kyc.findUnique({
        //     where: { userId },
        //  });

        const filters: prisma.KycWhereInput = {

            AND: [
                dateFilter ? { createdAt: dateFilter } : undefined,
            ].filter(Boolean) as prisma.KycWhereInput[]
        };

        const result = await swrCache(cacheKey, async () => {

            const [
                //property locations
                propertyLocationData, totalPropertyLocationData, 
                
                //rewards
                rewards

                //  totalSubmitted, totalVerified, totalPending, totalRejected,
                // totalSubmittedThisWeek, totalSubmittedLastWeek,
                // totalVerifiedThisWeek, totalVerifiedLastWeek,
                // totalPendingThisWeek, totalPendingLastWeek,
                // totalRejectedThisWeek, totalRejectedLastWeek,
            ] = await Promise.all([

            Prisma.property.findMany({
                where: { userId,  archived: false },
                select: { location: true, status: true, title: true},
                orderBy: { createdAt: "desc" },
            }
          ),
            Prisma.property.count({ where: { userId, archived: false,} }),

     

          Prisma.rewardHistory.findMany({
            where: {userId},
            select: {
                id: true,
                points: true,
                type: true,
                reason: true,
                createdAt: true
            }
          })


             //       Prisma.property.findMany({
        //         // where: { userId,  archived: false },
        //         select: {title: true, id: true, viewsCount: true, sharesCount: true, status: true, createdAt: true },
        //         orderBy: { createdAt: "desc" },
        //         take: limit
        //     }
        //   ),


            ]);

            // // total submitted
            // const totalSubmittedSubmissionChange = totalSubmittedLastWeek > 0 ? ((totalSubmittedThisWeek - totalSubmittedLastWeek) / totalSubmittedLastWeek) * 100 : totalSubmittedThisWeek > 0 ? 100 : 0;
            // const totalSubmittedTrend = totalSubmittedThisWeek > totalSubmittedLastWeek ? "positive" : totalSubmittedThisWeek < totalSubmittedLastWeek ? "negative" : "neutral";

            // // totalVerified
            // const totalVerifiedSubmissionChange = totalVerifiedLastWeek > 0 ? ((totalVerifiedThisWeek - totalVerifiedLastWeek) / totalVerifiedLastWeek) * 100 : totalVerifiedThisWeek > 0 ? 100 : 0;
            // const totalVerifiedTrend = totalVerifiedThisWeek > totalVerifiedLastWeek ? "positive" : totalVerifiedThisWeek < totalVerifiedLastWeek ? "negative" : "neutral";

            // // totalPending
            // const totalPendingSubmissionChange = totalPendingLastWeek > 0 ? ((totalPendingThisWeek - totalPendingLastWeek) / totalPendingLastWeek) * 100 : totalPendingThisWeek > 0 ? 100 : 0;
            // const totalPendingTrend = totalPendingThisWeek > totalPendingLastWeek ? "positive" : totalPendingThisWeek < totalPendingLastWeek ? "negative" : "neutral";

            // // totalRejected
            // const totalRejectedSubmissionChange = totalRejectedLastWeek > 0 ? ((totalRejectedThisWeek - totalRejectedLastWeek) / totalRejectedLastWeek) * 100 : totalRejectedThisWeek > 0 ? 100 : 0;
            // const totalRejectedTrend = totalRejectedThisWeek > totalRejectedLastWeek ? "positive" : totalRejectedThisWeek < totalRejectedLastWeek ? "negative" : "neutral";



          const totalEarning = rewards.reduce((v, c) => {

            if(c.type == "CREDIT"){
                v.CREDIT += c.points; 
            }

            if(c.type == "DEBIT"){
                v.DEBIT += c.points; 
            }

            return v;
          }, {CREDIT:  0, DEBIT: 0});

          let withdrawableEarning = 0;
            const difference = totalEarning.CREDIT - totalEarning.DEBIT;

            if (totalEarning.DEBIT > totalEarning.CREDIT) {
                withdrawableEarning = 0;
            } else if (difference >= 200) {
                withdrawableEarning = difference - 200;
            } else {
                withdrawableEarning = 0;
            }

            return {
               
                stats: {
                    // totalSubmitted: {
                    //     count: totalSubmitted,
                    //     percentage: Number(totalSubmittedSubmissionChange.toFixed(2)),
                    //     trend: totalSubmittedTrend
                    // },
                    // totalVerified: {
                    //     count: totalVerified,
                    //     percentage: Number(totalVerifiedSubmissionChange.toFixed(2)),
                    //     trend: totalVerifiedTrend

                    // },
                    // totalPending: {
                    //     count: totalPending,
                    //     percentage: Number(totalPendingSubmissionChange.toFixed(2)),
                    //     trend: totalPendingTrend
                    // },
                    // totalRejected: {
                    //     count: totalRejected,
                    //     percentage: Number(totalRejectedSubmissionChange.toFixed(2)),
                    //     trend: totalRejectedTrend
                    // },
                },
                rewardData: {
                    totalEarning,
                    withdrawableEarning,
                    rewards
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


// export const userDashbroadStatistic = async (req: Request, res: Response, next: NextFunction) => {
//      const userId = req.user?.id!;

//     const limit =  10;
//     const filterTime = req.query.filterTime || "this_year";

//     const cacheKey = `userdashbroad:${limit}:${filterTime}`;


//     const now = new Date();
//     let dateFilter: prisma.DateTimeFilter | undefined;

//     // const now = new Date();
//     const startOfThisWeek = new Date(now);
//     startOfThisWeek.setHours(0, 0, 0, 0);
//     startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

//     // Last week (previous Monday to previous Sunday)
//     const endOfLastWeek = new Date(startOfThisWeek);
//     endOfLastWeek.setSeconds(-1); // One second before current week starts

//     const startOfLastWeek = new Date(endOfLastWeek);
//     startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
//     startOfLastWeek.setHours(0, 0, 0, 0);



//     switch (filterTime) {
//         case "this_week": {
//             const startOfThisWeek = new Date(now);
//             startOfThisWeek.setHours(0, 0, 0, 0);
//             startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
//             dateFilter = { gte: startOfThisWeek };
//             break;
//         }

//         case "last_week": {
//             const startOfThisWeek = new Date(now);
//             startOfThisWeek.setHours(0, 0, 0, 0);
//             startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);

//             const endOfLastWeek = new Date(startOfThisWeek);
//             endOfLastWeek.setSeconds(-1);

//             const startOfLastWeek = new Date(endOfLastWeek);
//             startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
//             startOfLastWeek.setHours(0, 0, 0, 0);

//             dateFilter = { gte: startOfLastWeek, lte: endOfLastWeek };
//             break;
//         }

//         case "today": {
//             const startOfToday = new Date(now);
//             startOfToday.setHours(0, 0, 0, 0);
//             dateFilter = { gte: startOfToday };
//             break;
//         }

//         case "this_month": {
//             const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//             dateFilter = { gte: startOfMonth };
//             break;
//         }

//         case "last_month": {
//             const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//             const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month
//             endOfLastMonth.setHours(23, 59, 59, 999);
//             dateFilter = { gte: startOfLastMonth, lte: endOfLastMonth };
//             break;
//         }

//         default:
//             dateFilter = undefined;
//     }


//     try {

//          const kyc = await Prisma.kyc.findUnique({
//             where: { userId },
//          });

//         const filters: prisma.KycWhereInput = {

//             AND: [
//                 dateFilter ? { createdAt: dateFilter } : undefined,
//             ].filter(Boolean) as prisma.KycWhereInput[]
//         };

//         const result = await swrCache(cacheKey, async () => {

//             const [propertyLocationData, totalPropertyLocationData, properties,
//                 data,  totalSubmitted, totalVerified, totalPending, totalRejected,
//                 totalSubmittedThisWeek, totalSubmittedLastWeek,
//                 totalVerifiedThisWeek, totalVerifiedLastWeek,
//                 totalPendingThisWeek, totalPendingLastWeek,
//                 totalRejectedThisWeek, totalRejectedLastWeek,
//             ] = await Promise.all([

//             Prisma.property.findMany({
//                 where: { userId,  archived: false },
//                 select: { location: true, status: true, title: true},
//                 orderBy: { createdAt: "desc" },
//             }
//           ),
//             Prisma.property.count({ where: { userId, archived: false,} }),

//               Prisma.property.findMany({
//                 // where: { userId,  archived: false },
//                 select: {title: true, id: true, viewsCount: true, sharesCount: true, status: true, createdAt: true },
//                 orderBy: { createdAt: "desc" },
//                 take: limit
//             }
//           ),





//                 Prisma.kyc.findMany({
//                     where: filters,
//                     select: {
//                         id: true,
//                         user: {
//                             select: {
//                                 role: true,
//                                 fullname: true,
//                             }
//                         },
//                         documentType: true,
//                         createdAt: true,
//                         status: true
//                     },
//                     // skip,
//                     take: limit,
//                     orderBy: { createdAt: "desc" },
//                 }),
         

//                 Prisma.kyc.count({}),
//                 Prisma.kyc.count({ where: { status: "VERIFIED" } }),
//                 Prisma.kyc.count({ where: { status: "PENDING" } }),
//                 Prisma.kyc.count({ where: { status: "REJECTED" } }),


//                 // stat calculation
//                 // totalSubmitted stat
//                 Prisma.kyc.count({
//                     where: {
//                         createdAt: {
//                             gte: startOfThisWeek,
//                         },
//                     },
//                 }),
//                 Prisma.kyc.count({
//                     where: {
//                         createdAt: {
//                             gte: startOfLastWeek,
//                             lte: endOfLastWeek,
//                         },
//                     },
//                 }),


//                 // totalVerified stat
//                 Prisma.kyc.count({
//                     where: {
//                         status: "VERIFIED",
//                         createdAt: {
//                             gte: startOfThisWeek,
//                         },
//                     },
//                 }),
//                 Prisma.kyc.count({
//                     where: {
//                         status: "VERIFIED",
//                         createdAt: {
//                             gte: startOfLastWeek,
//                             lte: endOfLastWeek,
//                         },
//                     },
//                 }),

//                 // totalPending stat
//                 Prisma.kyc.count({
//                     where: {
//                         status: "PENDING",
//                         createdAt: {
//                             gte: startOfThisWeek,
//                         },
//                     },
//                 }),
//                 Prisma.kyc.count({
//                     where: {
//                         status: "PENDING",
//                         createdAt: {
//                             gte: startOfLastWeek,
//                             lte: endOfLastWeek,
//                         },
//                     },
//                 }),

//                 // totalRejected stat
//                 Prisma.kyc.count({
//                     where: {
//                         status: "REJECTED",
//                         createdAt: {
//                             gte: startOfThisWeek,
//                         },
//                     },
//                 }),
//                 Prisma.kyc.count({
//                     where: {
//                         status: "REJECTED",
//                         createdAt: {
//                             gte: startOfLastWeek,
//                             lte: endOfLastWeek,
//                         },
//                     },
//                 }),



//             ]);

//             // total submitted
//             const totalSubmittedSubmissionChange = totalSubmittedLastWeek > 0 ? ((totalSubmittedThisWeek - totalSubmittedLastWeek) / totalSubmittedLastWeek) * 100 : totalSubmittedThisWeek > 0 ? 100 : 0;
//             const totalSubmittedTrend = totalSubmittedThisWeek > totalSubmittedLastWeek ? "positive" : totalSubmittedThisWeek < totalSubmittedLastWeek ? "negative" : "neutral";

//             // totalVerified
//             const totalVerifiedSubmissionChange = totalVerifiedLastWeek > 0 ? ((totalVerifiedThisWeek - totalVerifiedLastWeek) / totalVerifiedLastWeek) * 100 : totalVerifiedThisWeek > 0 ? 100 : 0;
//             const totalVerifiedTrend = totalVerifiedThisWeek > totalVerifiedLastWeek ? "positive" : totalVerifiedThisWeek < totalVerifiedLastWeek ? "negative" : "neutral";

//             // totalPending
//             const totalPendingSubmissionChange = totalPendingLastWeek > 0 ? ((totalPendingThisWeek - totalPendingLastWeek) / totalPendingLastWeek) * 100 : totalPendingThisWeek > 0 ? 100 : 0;
//             const totalPendingTrend = totalPendingThisWeek > totalPendingLastWeek ? "positive" : totalPendingThisWeek < totalPendingLastWeek ? "negative" : "neutral";

//             // totalRejected
//             const totalRejectedSubmissionChange = totalRejectedLastWeek > 0 ? ((totalRejectedThisWeek - totalRejectedLastWeek) / totalRejectedLastWeek) * 100 : totalRejectedThisWeek > 0 ? 100 : 0;
//             const totalRejectedTrend = totalRejectedThisWeek > totalRejectedLastWeek ? "positive" : totalRejectedThisWeek < totalRejectedLastWeek ? "negative" : "neutral";



//             const AllProperties = properties.map(property => {
//                 return {
//                     slug: `#Arw-${property.id.slice(-3)}`,
//                     performance: {
//                         percentage: 0,
//                         trend: "neutral"

//                     },
//                     ...property
//                 }
//             })

//             return {
//                 properties: AllProperties,
//                 // data,
//                 stats: {
//                     totalSubmitted: {
//                         count: totalSubmitted,
//                         percentage: Number(totalSubmittedSubmissionChange.toFixed(2)),
//                         trend: totalSubmittedTrend
//                     },
//                     totalVerified: {
//                         count: totalVerified,
//                         percentage: Number(totalVerifiedSubmissionChange.toFixed(2)),
//                         trend: totalVerifiedTrend

//                     },
//                     totalPending: {
//                         count: totalPending,
//                         percentage: Number(totalPendingSubmissionChange.toFixed(2)),
//                         trend: totalPendingTrend
//                     },
//                     totalRejected: {
//                         count: totalRejected,
//                         percentage: Number(totalRejectedSubmissionChange.toFixed(2)),
//                         trend: totalRejectedTrend
//                     },
//                 },
//                 kycStatus: kyc?.status || "UNVERIFIED",
//                 reward: {
//                     totalEarning: 0,
//                     // soldEarning: 0,
//                     // uploadPropertyEarning: 0,
//                     // withdrawableEarning: 0,
//                 },
//                 propertyLocations : {
//                     locations: propertyLocationData,
//                     totalProperty: totalPropertyLocationData

//                 }

               
//             }
//         })


//         await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

//         new CustomResponse(200, true, "Fetched successfully", res, result);
//     } catch (error) {
//         next(new InternalServerError("Internal server error", 500));
//     }
// };


