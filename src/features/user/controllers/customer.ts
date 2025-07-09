import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import { KycStatus, Prisma as prisma } from "@prisma/client";
import { swrCache } from "../../../lib/cache";


export const createCustomerSupport = async (req: Request, res: Response, next: NextFunction) => {

    const { issueCategory, description } = req.body;

    try {

        const userId = req.user?.id!;
        const is_user_verified = req.user?.is_verified!;

        if (!is_user_verified) {
            return next(new InternalServerError("Please verify your email to continue this process.", 401));
        }

        const documentPhoto = "";

        // await Prisma.kyc.create({
        //     data: {
        //         userId,
        //         documentType,
        //         documentPhoto,
        //         documentNumber,
        //         status: "PENDING",


        //     }
        // });





        await redis.del("kyc:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


}


export const customerSupportDetail = async (req: Request, res: Response, next: NextFunction) => {
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
        const property = await Prisma.kyc.findUnique({
            where: { id }
        });



        if (!property) {
            return next(new InternalServerError("Property request not found", 404));
        }


        await redis.set(cacheKey, JSON.stringify(property), "EX", 60);


        new CustomResponse(200, true, "successfully", res, property);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


};

export const customerSupports = async (req: Request, res: Response, next: NextFunction) => {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const cacheKey = `kyc:${page}:${limit}:${search}`;

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
        const upperSearch = (search as string).toUpperCase();


        const filters = search
            ? {
                OR: [
                    { status: upperSearch as KycStatus }, // enum match 
                    { documentNumber: { contains: search, mode: "insensitive" }, }
                ].filter(Boolean) as prisma.KycWhereInput[],
            }
            : {};

        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.kyc.findMany({
                    where: filters,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.kyc.count({ where: filters }),
            ]);

            const totalPages = Math.ceil(total / limit);


            return {
                data,
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



// export const changeKycStatus = async (req: Request, res: Response, next: NextFunction) => {

//     const { id } = req.params;
//      const { status } = req.body;

//     try {

//         const kyc = await Prisma.kyc.findUnique({
//             where: { id }
//         });


//         if(!kyc){
//             return next(new InternalServerError("Kyc invalid", 403));
//         }


//         if (status == 'VERIFIED') {
//             // return next(new InternalServerError("Credential was verify", 403));
//         }

//         if (status == 'FAILED') {
//             // return next(new InternalServerError("Verification still in process", 403));
//         }

//         await Prisma.kyc.update({
//            where: { id },
//             data: {
//                 status
//             }
//         });


//         await redis.del("kyc:*");

//         new CustomResponse(200, true, "successfully", res,);
//     } catch (error) {
//         next(new InternalServerError("Internal server error", 500));
//     }


// }