import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from '../../../utils/helpers/response.util'
import dotenv from 'dotenv'
import { Prisma } from "../../../lib/prisma";
import { redis } from "../../../lib/redis";
import { Prisma as prisma, PropertyCategory } from "@prisma/client";
import { swrCache } from "../../../lib/cache";
dotenv.config();


export const createPropertyRequest = async (req: Request, res: Response, next: NextFunction) => {
  const {
    username,
    userRole,
    email,
    phoneNumber,
    propertyCategory,
    propertyType,
    furnishingStatus,
    numberOfBedrooms,
    numberOfBathrooms,
    budget,
    description,
    country,
    state,
    city,
    location,

  } = req.body;



  try {


    await Prisma.propertyRequest.create({
      data: {
        username,
        userRole,
        email,
        phoneNumber,
        propertyCategory,
        propertyType,
        furnishingStatus,
        propertyAddress: {
          country,
          state,
          city,
          location,
        },
        numberOfBedrooms: Number(numberOfBedrooms),
        numberOfBathrooms: Number(numberOfBathrooms),
        budget:  Number(budget),
        description
      }
    })

    await redis.del("propertyRequests:*");


    new CustomResponse(201, true, "Property request created successfully", res,);
  } catch (error) {
    // console.error("Property request creation error:", error);
    next(new InternalServerError("Failed to create property request."));
  }
};

export const propertyRequestDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const cacheKey = `propertyRequestDetail:${id}`;

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
    const property = await Prisma.propertyRequest.findUnique({
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

export const propertyRequests = async (req: Request, res: Response, next: NextFunction) => {

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const search = (req.query.search as string) || "";

  const cacheKey = `propertyRequests:${page}:${limit}:${search}`;

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
          { propertyCategory: upperSearch as PropertyCategory }, // enum match
          // { propertyType: upperSearch as PropertyType },    
          {
            propertyAddress: {
              country: { contains: search, mode: "insensitive" },
            },
          },
          {
            propertyAddress: {
              state: { contains: search, mode: "insensitive" },
            },
          },
          {
            propertyAddress: {
              city: { contains: search, mode: "insensitive" },
            },
          },
          {
            propertyAddress: {
              location: { contains: search, mode: "insensitive" },
            },
          },
        ].filter(Boolean) as prisma.PropertyRequestWhereInput[],
      }
      : {};


       const result = await swrCache(cacheKey, async () => {

    

    const [data, total] = await Promise.all([
      Prisma.propertyRequest.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      Prisma.propertyRequest.count({ where: filters }),
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