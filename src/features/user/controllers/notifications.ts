import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { swrCache } from "../../../lib/cache";


export const userNotifications = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?.id;
  try {

    const {
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const cacheKey = `notification:${userId}:${JSON.stringify(req.query)}`;


    const result = await swrCache(cacheKey, async () => {
      const [notifications, total, allusernotifications] = await Promise.all([
        Prisma.notification.findMany({
          where: {userId},
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.notification.count({ where: {userId} }),
        Prisma.notification.findMany({ where: {userId} }),
      ]);

      const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

        const stats = allusernotifications.reduce((acc, cur) => {
           if (!cur.read && acc[cur.category] !== undefined) {
          acc[cur.category] += 1;
          acc.total += 1;
        }
        return acc;
      
    }, {
      total,
       PROPERTY: 0,
  PROJECT: 0,
  REQUEST: 0,
  SUPPORT: 0,
  CHAT: 0,
  ACCOUNT: 0,
  ADMIN: 0,
  GENERAL: 0,
    })

      return {
        data: {
          notifications,
          stats
        },
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


export const notificationDetail = async(req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
   const userId = req?.user?.id;

  try {

 const result = await Prisma.notification.findUnique({
      where: { id , userId},
    });


    if (!result) {
      return next(new InternalServerError("notification not found", 404));
    }


    if(!result.read){
        await Prisma.notification.update({
          where: { id },
          data: { read: true },
          
        });
    }


   
    new CustomResponse(200, true, "success", res, result);

  } catch (error) {
    next(new InternalServerError("Server Error", 500));
  }
};



export const notificationDelete = async(req: Request, res: Response, next: NextFunction) => {
 const { id } = req.params;
   const userId = req?.user?.id;

  try {

 const result = await Prisma.notification.findUnique({
      where: { id , userId},
    });


    if (!result) {
      return next(new InternalServerError("notification not found", 404));
    }

     await Prisma.notification.delete({where: { id },});
    
    new CustomResponse(200, true, "success", res,);

  } catch (error) {
    next(new InternalServerError("Server Error", 500));
  }
}




export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  const { message, title } = req.body;

  try {

    const users = await Prisma.user.findMany();

    if (!users || users.length === 0) {
      return next(new InternalServerError("No users found", 404));
    }

    const notifications = users.map(user => {
      return Prisma.notification.create({
        data: {
          message,
          title,
          userId: user.id,
          category: "GENERAL"
        },
      });
    });

  
    await Promise.all(notifications);

    return new CustomResponse(200, true, "Notifications sent to all users", res);
  } catch (error) {
    return next(new InternalServerError("Server Error", 500));
  }
};



