import { NextFunction, Request, Response } from "express";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError, UnAuthorizedError } from "../../../lib/appError";
import { Prisma as prisma, PropertyVerifyStatus, } from "../../../../generated/prisma/client";
import { getDateRange } from "../../../utils/getDateRange";
import { suspendedAccountMailOption } from "../../../utils/mailer";
import { mailController } from "../../../utils/nodemailer";



export const getPartners = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {
            state,
            is_verified,
            page = "1",
            limit = "10"
        } = req.query;


        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const search = (req.query.search as string) || "";

        const cacheKey = `getPartners:${JSON.stringify(req.query)}`;

        const filterTime = req.query.filterTime || "this_year";

        const { current, previous } = getDateRange(filterTime.toString());


        const filters: prisma.ArellowPartnerWhereInput = {
            suspended: false,

            AND: [
                search
                    ? {
                        OR: [
                            { description: iLike(search) },
                            { businessName: iLike(search) },
                            { businessAdress: iLike(search) },
                            { state: iLike(search) }
                        ].filter(Boolean)
                    }
                    : undefined,


                state ? { state: iLike(state as string) } : undefined,
                is_verified ? { is_verified: is_verified == "true" ? true : false } : undefined,

            ].filter(Boolean) as prisma.ArellowPartnerWhereInput[]
        };



        const result = await swrCache(cacheKey, async () => {
            const [partners, total,] = await Promise.all([
                Prisma.arellowPartner.findMany({
                    where: { createdAt: { gte: current.start, lte: current.end }, ...filters },
                    include: {
                        media: {
                            select: {
                                url: true,
                                altText: true,
                                type: true,
                                photoType: true,
                                sizeInKB: true

                            }
                        },

                    },
                    orderBy: { createdAt: "desc" },
                    skip: (pageNumber - 1) * pageSize,
                    take: pageSize
                }),
                Prisma.arellowPartner.count({ where: { createdAt: { gte: current.start, lte: current.end }, ...filters }, }),

            ]);

            const totalPages = Math.ceil(total / pageSize);
            const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
            const prevPage = pageNumber > 1 ? pageNumber - 1 : null;



            return {
                data: partners,
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
        // next(new InternalServerError("Server Error", 500));
        next(error);

    }

};



export const getPartnerDetail = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

      const cacheKey = `getPartners:${id}`;


        const partner = await Prisma.arellowPartner.findUnique({ where: { id } });
        if (!partner) {
            return next(new InternalServerError("not found", 404));
        }


    try {

          const result = await swrCache(cacheKey, async () => {
            const [partners, landSellingCount, landSoldCount, landSelling, landSold ] = await Promise.all([
                Prisma.arellowPartner.findUnique({
            where: { id },
            include: {
                media: {
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                        photoType: true,
                        sizeInKB: true

                    }
                }
            }
        }),
                Prisma.lands.count({ where: { userId: req.user?.id, status: "APPROVED", salesStatus: "SELLING"}, }),
                Prisma.lands.count({ where: { userId: req.user?.id, status: "APPROVED", salesStatus: "SOLD"}, }),

                Prisma.lands.findMany({ where: { userId: req.user?.id, status: "APPROVED", salesStatus: "SELLING"},
                include: {
                media: {
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                        photoType: true,
                        sizeInKB: true

                    }
                }
            }
                }),
                Prisma.lands.findMany({ where: { userId: req.user?.id, status: "APPROVED", salesStatus: "SOLD"},
                include: {
                media: {
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                        photoType: true,
                        sizeInKB: true

                    }
                }
            }
                }),

            ]);



            return {
                data: {
                    partners,
                    landSellingCount,
                    landSoldCount,
                    landSelling,
                    landSold
                },
                
            };
        });


        new CustomResponse(200, true, "success", res, result);

    } catch (error) {
        next(new InternalServerError("Server Error", 500));

    }

};


export const partnerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { is_verified } = req.body;

    try {

        const partner = await Prisma.arellowPartner.findUnique({ where: { id } });
        if (!partner) {
            return next(new InternalServerError("not found", 404));
        }


        await Prisma.arellowPartner.update({
            where: { id },
            data: { is_verified },
        });



        await deleteMatchingKeys(`getPartners:*`);


        new CustomResponse(200, true, "Status changed", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }

};



export const partnerSuspend = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason, title } = req.body;

    try {

        const partner = await Prisma.arellowPartner.findUnique({ where: { id } });
        if (!partner) {
            return next(new InternalServerError("not found", 404));
        }

        await Prisma.arellowPartner.update({
            where: { id },
            data: {
                suspended: true
            },
        });


        const mailOptions = await suspendedAccountMailOption(partner.email, reason, title);
        mailController({ from: "noreply@arellow.com", ...mailOptions })



        await deleteMatchingKeys(`getPartners:*`);


        new CustomResponse(200, true, "Status changed", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }

};

export const partnerUnSuspend = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {

        const partner = await Prisma.arellowPartner.findUnique({ where: { id } });
        if (!partner) {
            return next(new InternalServerError("not found", 404));
        }


        await Prisma.arellowPartner.update({
            where: { id },
            data: {
                suspended: false
            },
        });



        await deleteMatchingKeys(`getPartners:*`);


        new CustomResponse(200, true, "Status changed", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }

};


const iLike = (field?: string) =>
    field ? { contains: field, mode: "insensitive" } : undefined;

