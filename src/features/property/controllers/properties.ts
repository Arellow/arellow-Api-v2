
import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError, UnAuthorizedError } from "../../../lib/appError";
import { Prisma as prisma, PropertyCategory, PropertyStatus, SalesStatus, UserRole } from '@prisma/client';
import { DirectMediaUploader } from "../services/directMediaUploader";
import { IMediaUploader, UploadJob } from "../services/mediaUploader";

import { MediaType } from '@prisma/client';
import { cloudinary } from "../../../configs/cloudinary";
import { redis } from "../../../lib/redis";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";


const mediaUploader: IMediaUploader = new DirectMediaUploader();

//All get requests

export const singleProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const cacheKey = `property:${id}`;

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
    const property = await Prisma.property.findUnique({
      where: { id },
      include: {
        amenities: true,
        likedBy: {
          select: {
            userId: true,
          },
        },
        media: {
          select: {
            url: true,
            altText: true,
            type: true,
            photoType: true,
            sizeInKB: true

          }
        },
        user: {
          select: {
            email: true,
            fullname: true,
            username: true,
            is_verified: true,
            avatar: true,
            approvedProperties: {
              include: {
                _count: true
              }
            }

          }
        }

      },
    });



    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    


    await redis.set(cacheKey, JSON.stringify(property), "EX", 60);


    new CustomResponse(200, true, "successfully", res, property);
  } catch (error) {

    next(new InternalServerError("Internal server error", 500));
    // next(error)
  }


};


// user
export const getPropertiesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const {
      salesStatus,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      amenities,
      features,
      
      minPrice,
      maxPrice,

      status,
      page = "1",
      limit = "10"
    } = req.query;

    const search = (req.query.search as string) || "";

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);


    const cacheKey = `getPropertiesByUser:${userId}:${JSON.stringify(req.query)}`;

    const featuresArray = (features as string)?.split(",").filter(v => v !== "") ?? [];
    const amenitiesArray = (amenities as string)?.split(",").filter(v => v !== "") ?? [];


   const matchedCategory = getValidCategory(search);
    const filters: prisma.PropertyWhereInput = {
      userId,
      archived: false,
      AND: [
        search
          ? {
            OR: [
            { title: iLike(search) },
            matchedCategory ? { category: matchedCategory } : null,
            { city: iLike(search) },
            { state: iLike(search) },
            { country: iLike(search) }
            ].filter(Boolean)
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { category: category as PropertyCategory } : undefined,
      
        state ? { state: iLike(state as string) } : undefined,
        city ? { city: iLike(city as string) } : undefined,
        country ? { country: iLike(country as string) } : undefined,
        neighborhood ? { neighborhood: iLike(neighborhood as string) } : undefined,

        amenitiesArray.length > 0 ? { amenities: { some: { name: { in: amenitiesArray }}} }: undefined,
        featuresArray.length > 0 ? { features: { hasSome: featuresArray } } : undefined,
        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        status ? { status: status as PropertyStatus } : undefined,
         (minPrice || maxPrice)
      ? {
        
          price: {
             is: { amount: {
               ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
               ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {})
             }
            }

          }
        }
      : undefined,
      ].filter(Boolean) as prisma.PropertyWhereInput[]
    };


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            },
            amenities: {
              select: {
                name: true,
                photoUrl: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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
    console.log({error})
    next(new InternalServerError("Server Error", 500));

  }

};



// property
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      type,
      page = "1",
      limit = "10"
    } = req.query;


    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);


    const cacheKey = `getProperties:${JSON.stringify(req.query)}`;



    const filters: prisma.PropertyWhereInput = {
      
      archived: false,
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,


        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[]
    };


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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







export const sellingProperties = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      page = "1",
      limit = "10"
    } = req.query;



    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const cacheKey = `sellingProperties:${JSON.stringify(req.query)}`;

    const filters: prisma.PropertyWhereInput = {
      archived: false,
      status: "APPROVED",
      salesStatus: "SELLING",
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,

        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[] // 👈 IMPORTANT: ensure no `undefined` entries
    };
   
    
const result = await swrCache(cacheKey, async () => {
  const [properties, total] = await Promise.all([
    Prisma.property.findMany({
        where: filters,
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
          user: {
            select: {
              email: true,
              fullname: true,
              username: true,
              is_verified: true,
              avatar: true,
              approvedProperties: {
                include: {
                  _count: true
                }
              }

            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
    Prisma.property.count({ where: filters })
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









export const propertiesListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      page = "1",
      limit = "10"
    } = req.query;


    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);


    const cacheKey = `propertyListing:${JSON.stringify(req.query)}`;



    const filters: prisma.PropertyWhereInput = {

      archived: false,
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,


        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[]
    };


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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





// for admin
export const getAllProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);


    const cacheKey = `getAllProperties:${JSON.stringify(req.query)}`;

    const filters: prisma.PropertyWhereInput = {
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,


        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[]
    };

    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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






export const featureProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      page = "1",
      limit = "10"
    } = req.query;


    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const cacheKey = `featureProperties:${JSON.stringify(req.query)}`;

    const filters: prisma.PropertyWhereInput = {
      archived: false,
      status: "APPROVED",
      salesStatus: "SELLING",
      isFeatureProperty: true,
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,


        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[] // 👈 IMPORTANT: ensure no `undefined` entries
    };

    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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

export const recentProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const cacheKey = `recentProperties:${JSON.stringify(req.query)}`;

    const filters: prisma.PropertyWhereInput = {
      archived: false,
      status: "APPROVED",
      salesStatus: "SELLING",
      isFeatureProperty: false,
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,

        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[] // 👈 IMPORTANT: ensure no `undefined` entries
    };


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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










export const getLikedPropertiesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
     const cacheKey = `saved:${userId}`;

      const {
      search,
      page = "1",
      limit = "10"
    } = req.query;

        const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

     const cached = await redis.get(cacheKey);
  if (cached) {

    res.status(200).json({
      success: true,
      message: "successfully. from cache",
      data: JSON.parse(cached)
    });
    return
  };

        
    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
       Prisma.userPropertyLike.findMany({
      where: { userId, },
      include: {
        property: {
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
        }
      },
    }),
        Prisma.userPropertyLike.count({ where: { userId, }})
      ]);

      const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

        const data = properties.map((like) => like.property) || [];

      return {
        data,
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


     await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

    new CustomResponse(200, true, "success", res, result);


  } catch (error) {
    next(new InternalServerError("Failed to fetch liked properties", 500));
  }

};

// admin
export const getAllArchivedProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const cacheKey = `getAllArchivedProperties:${JSON.stringify(req.query)}`;

    const filters: prisma.PropertyWhereInput = {
      archived: true,
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,


        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[]
    };

    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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
// user
export const getArchivedPropertiesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,

      bathrooms,
      bedrooms,
      floors,
      category,
      state,
      city,
      country,
      neighborhood,
      features,
      amenities,


      page = "1",
      limit = "10"
    } = req.query;


    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const cacheKey = `getArchivedPropertiesByUser:${userId}:${JSON.stringify(req.query)}`;

    const filters: prisma.PropertyWhereInput = {
      userId,
      archived: true,
      AND: [
        search
          ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { category: { contains: search as string, mode: 'insensitive' } },
              { city: { contains: search as string, mode: 'insensitive' } },
              { state: { contains: search as string, mode: 'insensitive' } },
              { country: { contains: search as string, mode: 'insensitive' } }
            ]
          }
          : undefined,

        bathrooms ? { bathrooms: parseInt(bathrooms as string) } : undefined,
        bedrooms ? { bedrooms: parseInt(bedrooms as string) } : undefined,
        floors ? { floors: parseInt(floors as string) } : undefined,
        category ? { contains: category as string, mode: 'insensitive' } : undefined,
        state ? { contains: state as string, mode: 'insensitive' } : undefined,
        city ? { contains: city as string, mode: 'insensitive' } : undefined,
        country ? { contains: country as string, mode: 'insensitive' } : undefined,
        neighborhood ? { contains: neighborhood as string, mode: 'insensitive' } : undefined,
        amenities ? { contains: amenities as string, mode: 'insensitive' } : undefined,
        features ? { contains: features as string, mode: 'insensitive' } : undefined,

        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
        maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
      ].filter(Boolean) as prisma.PropertyWhereInput[]
    };


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: filters,
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
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                is_verified: true,
                avatar: true,
                approvedProperties: {
                  include: {
                    _count: true
                  }
                }

              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: filters })
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




// others





export const archiveProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {

    const property = await Prisma.property.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    // Ownership check:
    if (property.userId !== userId) {
      return next(new UnAuthorizedError("Forbidden: only owner can update status", 403));
    };

    await Prisma.property.update({
      where: { id },
      data: { archived: true , status: PropertyStatus.TRASHED},
    });

      await deleteMatchingKeys(`property:${id}:*`);
    await deleteMatchingKeys(`getAllProperties:*`);

    await deleteMatchingKeys(`getPropertiesByUser:${userId}:*`);

    new CustomResponse(200, true, "Property archived", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


export const unArchiveProperty = async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params;
  const userId = req.user?.id;

  try {

    const property = await Prisma.property.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    // Ownership check:
    if (property.userId !== userId) {
      return next(new UnAuthorizedError("Forbidden: only owner can update status", 403));
    };

    await Prisma.property.update({
      where: { id },
      data: { archived: false },
    });

       await deleteMatchingKeys(`property:${id}:*`);
    await deleteMatchingKeys(`getAllProperties:*`);

    await deleteMatchingKeys(`getPropertiesByUser:${userId}:*`);

    new CustomResponse(200, true, "Property unarchived", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


// uncheck

export const markAsFeatureProperty = async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params;

  try {

    const property = await Prisma.property.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    await Prisma.property.update({
      where: { id },
      data: { isFeatureProperty: true },
    });

    // 


    await deleteMatchingKeys(`featureProperties:*`);


    new CustomResponse(200, true, "Property is added to feature", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


export const unmarkAsFeatureProperty = async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params;

  try {

    const property = await Prisma.property.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    await Prisma.property.update({
      where: { id },
      data: { isFeatureProperty: false },
    });

     await deleteMatchingKeys(`featureProperties:*`);

    new CustomResponse(200, true, "Property is remove from feature", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


// isFeatureProperty
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id: propertyId } = req.params;
  try {

      const property = await Prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    //  Delete old media
    const oldMedia = await Prisma.media.findMany({
      where: { propertyId },
    });

    // Delete from Cloudinary
    for (const media of oldMedia) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === 'VIDEO' ? 'video' : 'image',
        });
      } catch (err) {
        // console.warn(`Failed to delete media ${media.publicId}:`, err);
      }
    }

    // Delete from DB
    await Prisma.media.deleteMany({ where: { propertyId } });

    await Prisma.userPropertyLike.deleteMany({ where: { propertyId } });
    await Prisma.amenity.deleteMany({ where: { propertyId } });

    await Prisma.property.delete({ where: { id: propertyId } });

 await deleteMatchingKeys(`getAllProperties:*`);
 await deleteMatchingKeys(`property:*`);

    new CustomResponse(200, true, "Property deleted permanently", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));

  }

};



export const statusProperty = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  const propertyId = req.params.id;
  const { salesStatus } = req.body;

 

  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN"; 

  
  try {

    const property = await Prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }


    // Ownership check:
    if (!isAdmin && property.userId !== userId) {

      return next(new UnAuthorizedError("Forbidden: only owner can update status", 403));
    }

    await Prisma.property.update({
      where: { id: propertyId },
      data: {
        salesStatus,
      },
    });

    new CustomResponse(200, true, `status updated to ${salesStatus}`, res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};



export const approveProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {

    const property = await Prisma.property.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    await Prisma.property.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        approvedBy: { connect: { id: req.user?.id! } },
      },
    });

      await deleteMatchingKeys(`property:${id}:*`);
    await deleteMatchingKeys(`getAllProperties:*`);
    await deleteMatchingKeys(`getPropertiesByUser:${property.userId}:*`);


    new CustomResponse(200, true, "Property approved", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


export const rejectProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return next(new InternalServerError("Rejection reason is required", 400));
  }

  try {


    const property = await Prisma.property.findUnique({ where: { id } });
    if (!property) {
      return next(new InternalServerError("Property not found", 404));
    }

    await Prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedBy: { connect: { id: req.user?.id! } },
      },
    });

    await deleteMatchingKeys(`property:${id}:*`);
    await deleteMatchingKeys(`getAllProperties:*`);
    await deleteMatchingKeys(`getPropertiesByUser:${property.userId}:*`);

    new CustomResponse(200, true, "Property rejected", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


// likes a property
export const likeProperty = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;
  const propertyId = req.params.id;

  const cacheKey = `saved:${userId}`;

  try {
    // Check if already liked
    const existingLike = await Prisma.userPropertyLike.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingLike) {
      next(new InternalServerError("Property already liked", 400));
    }

    // Create like relation
    await Prisma.userPropertyLike.create({
      data: {
        user: { connect: { id: userId } },
        property: { connect: { id: propertyId } },
      },
    });

    // Increment likes count
    await Prisma.property.update({
      where: { id: propertyId },
      data: { likesCount: { increment: 1 } },
    });


    await deleteMatchingKeys(cacheKey);

    new CustomResponse(200, true, "Property liked", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};

// Unlike a property
export const unLikeProperty = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;
  const propertyId = req.params.id;
  const cacheKey = `saved:${userId}`;

  try {
    // Delete the like relation
    const deleteResult = await Prisma.userPropertyLike.deleteMany({
      where: {
        userId,
        propertyId,
      },
    });

    if (deleteResult.count === 0) {
      next(new InternalServerError("Like does not exist", 400));
    }

    // Decrement likes count
    await Prisma.property.update({
      where: { id: propertyId },
      data: { likesCount: { decrement: 1 } },
    });

    await deleteMatchingKeys(cacheKey);

    new CustomResponse(200, true, "Property unliked", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


// untest route
export const mediaForProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { propertyId } = req.params;
  const files = req.files as Express.Multer.File[];
  const metaArray = req.body.metadata;
  const userId = req.user?.id;

  if (!files || files.length === 0 || !metaArray) {
    new CustomResponse(404, true, "Files and metadata are required", res,);
    return
  }

  // Parse metadata array (expecting JSON strings)
  let metadata;
  try {

    const property = await Prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      new CustomResponse(404, true, "Property not found", res,);
      return
    }

    // Ownership check:
    if (property.userId !== userId) {
      new CustomResponse(403, true, "Forbidden: only owner can update status", res,);
      return
    };


    metadata = Array.isArray(metaArray)
      ? metaArray.map((m) => JSON.parse(m))
      : [JSON.parse(metaArray)];
  } catch {
    new CustomResponse(404, true, "Invalid metadata JSON", res,);
    return
  }

  if (metadata.length !== files.length) {
    new CustomResponse(404, true, "Metadata count must match files count", res,);
    return
  }

  const uploadJobs: UploadJob[] = files.map((file, i) => ({
    filePath: file.path,
    propertyId,
    meta: metadata[i],
  }));

  try {

    const uploaded = await mediaUploader.upload(uploadJobs);

    if (uploaded.length > 0) {
      await Prisma.media.createMany({
        data: uploaded.map((u) => ({
          propertyId,
          type: u.type as MediaType,
          url: u.url,
          publicId: u.publicId,
          caption: u.caption,
          altText: u.altText,
          order: u.order,
          width: u.width,
          height: u.height,
          duration: u.duration,
          sizeInKB: u.sizeInKB,
          format: u.format,
        })),
      });
    }

    new CustomResponse(200, true, "Upload successful", res, uploaded);
  } catch (error) {
    next(new InternalServerError("Upload faile", 500));
  }
};



function getValidCategory(value: string ): PropertyCategory | null {
  if(!value) return null
  const lowerValue = value.toLowerCase();
  return (
    Object.values(PropertyCategory).find(
      (category) => category.toLowerCase().includes(lowerValue)
    ) ?? null
  );
}


const iLike = (field?: string) =>
  field ? { contains: field, mode: "insensitive" } : undefined;