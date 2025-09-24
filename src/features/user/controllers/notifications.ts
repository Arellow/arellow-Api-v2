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
      const [properties, total] = await Promise.all([
        Prisma.notification.findMany({
          where: {userId},
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.notification.count({ where: {userId} })
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