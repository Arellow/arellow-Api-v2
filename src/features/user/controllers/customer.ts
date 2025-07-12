import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import {  Prisma as prisma, ticketStatus } from "@prisma/client";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { mediaUploadQueue } from "../../property/queues/media.queue";
import { createTicketMailOption, replyTicketMailOption } from "../../../utils/mailer";
import { mailController } from "../../../utils/nodemailer";
import dayjs from "dayjs"

function generateSlug(): string {
    const year = new Date().getFullYear();
    const id = Date.now();


    // Date.now
    const prefix = "AR";
    return `Ticket# ${year}-${prefix}${id}`;
}


export const createCustomerSupport = async (req: Request, res: Response, next: NextFunction) => {

    const { category, description, title } = req.body;

    const fields = req.files as { [fieldname: string]: Express.Multer.File[] } || [];

    try {

        const userId = req.user?.id!;

        const ticket = await Prisma.ticket.create({
            data: {
                title,
                category,
                description,
                slug: generateSlug(),
                user: { connect: { id: userId } },
            },
            include: {
                user: true
            }
        });

        if (ticket) {

            for (const [_, files] of Object.entries(fields)) {
                
                for (const file of files) {

                    await mediaUploadQueue.add('upload', {
                        propertyId: ticket.id,
                        file: {
                            buffer: file.buffer,
                            originalname: file.originalname,
                        },
                        meta: {
                            type: 'PHOTO',
                            photoType: "TICKET",
                        },
                    });

                }

            }

        }

        

         const mailOptions = await createTicketMailOption({
            // email: "axle.wake@fsitip.com",
            email: "andrewchidiebere@arellow.com",
            // email: ticket.user.email,
             userName: ticket.user.username, 
             subject: title,
             date: dayjs(ticket.createdAt).format("MMMM D, YYYY @ h:m A"),
             ticketNumber: ticket.slug
            
            });
        mailController({from: "support@arellow.com", ...mailOptions});


        await deleteMatchingKeys("ticket:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


}


export const customerSupportDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const cacheKey = `ticket:${id}`;

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
        const ticket = await Prisma.ticket.findUnique({
            where: { id },
            include: {
                ticketPhotos: {
                    select: {
                        url: true
                    }
                },
                user: {
                    select: {
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                }

            },
        });



        if (!ticket) {
            return next(new InternalServerError("ticket request not found", 404));
        }


        await redis.set(cacheKey, JSON.stringify(ticket), "EX", 60);


        new CustomResponse(200, true, "successfully", res, ticket);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


};

export const customerSupports = async (req: Request, res: Response, next: NextFunction) => {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
     const {status} = req.query;

    const search = (req.query.search as string) || "";

    const cacheKey = `ticket:${page}:${limit}:${search}:${status}`;

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

        const filters = search
            ? {
                OR: [
                     status ? { status: status as ticketStatus } : null,
                    { title: { contains: search, mode: "insensitive" }, },
                    { category: { contains: search, mode: "insensitive" }, },
                    { description: { contains: search, mode: "insensitive" }, }
                ].filter(Boolean) as prisma.TicketWhereInput[],
            }
            : {...(status ? { status: status as ticketStatus } : {})};

        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.ticket.findMany({
                    where: filters,
                    select: {
                        id: true,
                        slug: true,
                        createdAt: true,
                        title: true,
                        category : true,
                        description : true,
                        status : true,
                        user: {
                            select: {
                                fullname: true,
                                email: true,
                                avatar: true
                            }
                        },

                    },
                    // include: {
                    //     // ticketPhotos: {
                    //     //     select: {
                    //     //         url: true
                    //     //     }
                    //     // },
                    //     user: {
                    //         select: {
                    //             fullname: true,
                    //             email: true,
                    //             avatar: true
                    //         }
                    //     }

                    // },
                    
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.ticket.count({ where: filters }),
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

export const usercustomerSupportTicket = async (req: Request, res: Response, next: NextFunction) => {

    const {status} = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
     const userId = req.user?.id!;

    const search = (req.query.search as string) || "";

    const cacheKey = `ticket:${userId}:${page}:${limit}:${search}:${status}`;

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
       
        const filters = search
            ? {
                userId,
                OR: [
                    status ? { status: status as ticketStatus } : null,
                    { title: { contains: search, mode: "insensitive" }, },
                    { category: { contains: search, mode: "insensitive" }, },
                    { description: { contains: search, mode: "insensitive" }, }
                ].filter(Boolean) as prisma.TicketWhereInput[],
            }
            : {
                userId,
                 ...(status ? { status: status as ticketStatus } : {})
            };

        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.ticket.findMany({
                    where: filters,
                    select: {
                        createdAt: true,
                        category: true,
                        status: true,
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.ticket.count({ where: filters }),
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

export const changeTicketStatus = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
     const { status, message } = req.body;
      const userId = req.user?.id!;



    try {

        const admin = await Prisma.user.findUnique({where: {id: userId}});


         if(!admin){
            return next(new InternalServerError("Unauthorise", 403));
        }

        const ticket = await Prisma.ticket.findUnique({
            where: { id },
             include: {
                user: true
            }
        });


        if(!ticket){
            return next(new InternalServerError("Ticket invalid", 403));
        }


        await Prisma.ticket.update({
           where: { id },
            data: {
                status,
                slug: generateSlug()
            }
        });


        if(message){

            const mailOptions = await replyTicketMailOption({
               email: ticket.user.email,
                user_name: ticket.user.username, 
                ticket_id: ticket.slug, 
                ticket_subject: ticket.title,
                ticket_status: status,
                agent_name: admin?.fullname! || admin?.username,
                support_reply: message
               
               });
    
               
               mailController({from: "support@arellow.com", ...mailOptions});
        }


            
            await deleteMatchingKeys("ticket:*");

        new CustomResponse(200, true, "successfully", res);

    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


};