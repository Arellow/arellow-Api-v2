
import { NextFunction, Request, Response } from "express";
import { Prisma , } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
import { Prisma as prisma , SalesStatus} from '@prisma/client';
import { DirectMediaUploader } from "../services/directMediaUploader";
import { IMediaUploader, UploadJob } from "../services/mediaUploader";

import { MediaType } from '@prisma/client';

type Amenity = {
  name: string;
  photoUrl: string;
}


const mediaUploader: IMediaUploader = new DirectMediaUploader();

export const createNewProperty = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const userId = req.user?.id!;

    const {
      title,
      description,
      bathrooms,
      bedrooms,
      category,
      city,
      country,
      floors,
      location,

      neighborhood,
      price,
      squareMeters,
      state,
      features,

    } = req.body;

    const amenities: Amenity[] = req.body.amenities || []

    // Basic validation
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return 
    }

    // Validate amenities format if provided
    if (amenities && !Array.isArray(amenities)) {
      res.status(400).json({ error: 'Amenities must be an array' });
      return 
    }


    if (amenities) {
      for (const amenity of amenities) {
        if (typeof amenity.name !== 'string' || typeof amenity.photoUrl !== 'string') {
          res.status(400).json({ error: 'Each amenity must have name and photoUrl strings' });
          return 
        }
      }
    }
    if (features) {
      for (const amenity of amenities) {
        if (typeof amenity.name !== 'string' || typeof amenity.photoUrl !== 'string') {
          res.status(400).json({ error: 'Each amenity must have name and photoUrl strings' });
          return 
        }
      }
    }




    const propertyAmenities = amenities.map(amenity => {
      return { name: amenity.name, photoUrl: amenity.photoUrl }
    })

    // Create property
    const newProperty = await Prisma.property.create({
      data: {
        title,
        description,
        amenities: {
          create: propertyAmenities
        },
        userId,
        bathrooms,
        bedrooms,
        category,
        city,
        country,
        floors,
        location,
        neighborhood,
        price,
        squareMeters,
        state,
        features
      },
    });


    new CustomResponse(201, true, "Featured projects fetched successfully", res, newProperty);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }


}


export const singleProperty = async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
  try {

    // find single
    const response =  await Prisma.property.findUnique({
        where: { id},
        include: { 
          amenities: true ,
           user: {
            include: {approvedProperties: true,}, 
            omit: {password: true}
           }
          
          },
      });

    new CustomResponse(201, true, "Featured projects fetched successfully", res, response);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }


}

// likes a property
export const likeProperty = async (req: Request, res: Response, next: NextFunction) =>  {
  const userId = req.user?.id!;
  const propertyId = req.params.id;

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

    if(existingLike) {
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

      new CustomResponse(200, true, "Property liked", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};

// Unlike a property
export const unLikeProperty = async (req: Request, res: Response, next: NextFunction) =>  {
  const userId = req.user?.id!;
  const propertyId = req.params.id;

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

     new CustomResponse(200, true, "Property unliked", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};

export const getLikedPropertiesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
 
    const likes = await Prisma.userPropertyLike.findMany({
      where: { userId },
      include: {
        property: true,
      },
    });

    const properties = likes.map((like) => like.property);

   new CustomResponse(200, true, "success", res,properties);
  } catch (error) {
    next(new InternalServerError("Failed to fetch liked properties", 500));
  }

};


export const getPropertiesByUser = async (req: Request, res: Response, next: NextFunction)  => {
  try {
    const userId = req.user?.id;
 
    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

   const filters: prisma.PropertyWhereInput = {
  userId,
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
    salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
    minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
    maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
  ].filter(Boolean) as prisma.PropertyWhereInput[] // 👈 IMPORTANT: ensure no `undefined` entries
};
    const [properties, total] = await Promise.all([
      Prisma.property.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
       Prisma.property.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
    const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
     const canGoNext = pageNumber < totalPages;
    const canGoPrev = pageNumber > 1;

     new CustomResponse(200, true, "success", res, {
      data: properties,
      pagination: {
        total,
        page: pageNumber,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        nextPage,
        prevPage,
        canGoNext,
        canGoPrev
      }
    });
  } catch (error) {
    next(new InternalServerError("Server Error", 500));
  }

};

export const recentPropertiesByUser = async (req: Request, res: Response, next: NextFunction)  => {
  try {
    const userId = req.user?.id;
 
    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

   const filters: prisma.PropertyWhereInput = {
  userId,
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
    salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
    minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
    maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
  ].filter(Boolean) as prisma.PropertyWhereInput[] // 👈 IMPORTANT: ensure no `undefined` entries
};
    const [properties, total] = await Promise.all([
      Prisma.property.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
       Prisma.property.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
    const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
     const canGoNext = pageNumber < totalPages;
    const canGoPrev = pageNumber > 1;

     new CustomResponse(200, true, "success", res, {
      data: properties,
      pagination: {
        total,
        page: pageNumber,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        nextPage,
        prevPage,
        canGoNext,
        canGoPrev
      }
    });
  } catch (error) {
    next(new InternalServerError("Server Error", 500));
  }

};


export const featureProperties = async (req: Request, res: Response, next: NextFunction)  => {
  try {
    // const userId = req.user?.id;
 
    const {
      search,
      salesStatus,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

   const filters: prisma.PropertyWhereInput = {
  // userId,
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
    salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
    minPrice ? { price: { gte: parseFloat(minPrice as string) } } : undefined,
    maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : undefined
  ].filter(Boolean) as prisma.PropertyWhereInput[] // 👈 IMPORTANT: ensure no `undefined` entries
};
    const [properties, total] = await Promise.all([
      Prisma.property.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
       Prisma.property.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
    const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
     const canGoNext = pageNumber < totalPages;
    const canGoPrev = pageNumber > 1;

     new CustomResponse(200, true, "success", res, {
      data: properties,
      pagination: {
        total,
        page: pageNumber,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        nextPage,
        prevPage,
        canGoNext,
        canGoPrev
      }
    });
  } catch (error) {
    next(new InternalServerError("Server Error", 500));
  }

};



 export const approveProperty = async (req: Request, res: Response, next: NextFunction) =>  {
  const { id } = req.params;

  try {
  await Prisma.property.update({
    where: { id },
    data: {
      status: 'APPROVED',
      rejectionReason: null,
      approvedBy: { connect: { id: req.user?.id! } },
    },
  });


      new CustomResponse(200, true, "Property approved", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};



export const rejectProperty = async (req: Request, res: Response, next: NextFunction) =>  {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
     new InternalServerError("Rejection reason is required", 400)
     return
  }

  try {
    await Prisma.property.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectionReason: reason,
      approvedBy: { connect: { id: req.user?.id! } },
    },
  });

      new CustomResponse(200, true, "Property rejected", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


export const archiveProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {

     const property = await Prisma.property.findUnique({ where: { id } });
  if (!property) {
     new CustomResponse(404, true, "Property not found", res,);
     return
  } 

  // Ownership check:
  if (property.userId !== userId) {
    new CustomResponse(403, true, "Forbidden: only owner can update status", res,);
     return
  };

    await Prisma.property.update({
    where: { id },
    data: { archived: true },
  });
  
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
     new CustomResponse(404, true, "Property not found", res,);
     return
  } 

  // Ownership check:
  if (property.userId !== userId) {
    new CustomResponse(403, true, "Forbidden: only owner can update status", res,);
     return
  };

    await Prisma.property.update({
    where: { id },
    data: { archived: false },
  });
  
    new CustomResponse(200, true, "Property archived", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {

      await Prisma.property.delete({ where: { id } });

      new CustomResponse(200, true, "Property deleted permanently", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


export const statusProperty = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;  

  const propertyId = req.params.id;
  const { salesStatus } = req.body;

  if (!['SELLING', 'SOLD'].includes(salesStatus)) {
     new CustomResponse(400, true, "Invalid salesStatus value", res,);
     return
  }
  try  {

  const property = await Prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    new CustomResponse(404, true, "Property not found", res,);
     return
  }
    

  // Ownership check:
  if (property.userId !== userId) {
   new CustomResponse(403, true, "Forbidden: only owner can update status", res,);
     return
  }

    await Prisma.property.update({
    where: { id: propertyId },
    data: {
      salesStatus,
    },
  });

    new CustomResponse(200, true, "status updated", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


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