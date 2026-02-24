import { NextFunction, Request, Response } from "express";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError , UnAuthorizedError} from "../../../lib/appError";
import { Prisma as prisma, PropertyVerifyStatus, } from "../../../../generated/prisma/client";
import { getDateRange } from "../../../utils/getDateRange";



export const getPropertyVerifications = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
   status,
      page = "1",
      limit = "10"
    } = req.query;

    
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
 

    const cacheKey = `getPropertiesVerifications:${JSON.stringify(req.query)}`;

    const filterTime = req.query.filterTime || "this_year";
 
 
     const { current, previous } = getDateRange(filterTime.toString());
 

    const filters: prisma.PropertyVerifyWhereInput = {};

if (
  status &&
  Object.values(PropertyVerifyStatus).includes(status as PropertyVerifyStatus)
) {
  filters.paymentStatus = status as PropertyVerifyStatus;
}


    const result = await swrCache(cacheKey, async () => {
      const [propertiesVerified, total,] = await Promise.all([
        Prisma.propertyVerify.findMany({
          where: {createdAt: { gte: current.start, lte: current.end }, ...filters},
          include: {
            documents: {
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
        Prisma.propertyVerify.count({ where: {createdAt: { gte: current.start, lte: current.end }, ...filters},}),

      ]);

      const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;


    
      return {
        data: propertiesVerified,
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


export const getPropertyVerificationDetail = async (req: Request, res: Response, next: NextFunction) => {
 
  const {id} = req.params;
 
  try {



    const data = await  Prisma.propertyVerify.findUnique({
      where: {id},
      include: {
        documents: true
      }
    })

     

    
    new CustomResponse(200, true, "success", res, data);


  } catch (error) {
    next(new InternalServerError("Server Error", 500));

  }

};


export const propertyVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const {status} = req.body;

  try {

    const property = await Prisma.propertyVerify.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("not found", 404));
    }

    if(property.paymentStatus == "PENDING" || property.paymentStatus == "CANCELLED") {
      return next(new UnAuthorizedError("status can't be change", 404));
    }

    await Prisma.propertyVerify.update({
      where: { id },
      data: {
        paymentStatus: status
      },
    });



    await deleteMatchingKeys(`getPropertiesVerifications:*`);


    new CustomResponse(200, true, "Status changed", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};