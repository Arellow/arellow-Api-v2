
import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError, UnAuthorizedError } from "../../../lib/appError";
import { Prisma as prisma, PropertyStatus, SalesStatus, UserRole } from '@prisma/client';
import { DirectMediaUploader } from "../services/directMediaUploader";
import { IMediaUploader, UploadJob } from "../services/mediaUploader";

import { MediaType } from '@prisma/client';
import { mediaUploadQueue } from "../queues/media.queue";
import { cloudinary } from "../../../configs/cloudinary";
import { redis } from "../../../lib/redis";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";

type Amenity = {
  name: string;
  photoUrl: string;
}


const mediaUploader: IMediaUploader = new DirectMediaUploader();



export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { propertyId } = req.params;
    // const userId = req.user?.id!;
    // const is_user_verified = req.user?.is_verified!;

    // if (!is_user_verified) {
    //   return next(new InternalServerError("Email not verify", 401));
    // }


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
      amenities,

      isFeatureProperty,
      yearBuilt,
      stage,
      progress,
      stagePrice 

    } = req.body;

    const parsedFeatures: string[] = typeof features === 'string' ? JSON.parse(features) : features;
    const parsedAmenities: Amenity[] = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    const parsedLocation: {
      lat: string,

      lng: string
    } = typeof location === 'string' ? JSON.parse(location) : location;


    // Basic validation
    if (!title || !description) {
      return next(new InternalServerError("Title and description are required", 400));

    }

    // Validate amenities format if provided
    if (parsedAmenities && !Array.isArray(parsedAmenities)) {
      return next(new InternalServerError("Amenities must be an array", 400));
    }


    if (parsedAmenities) {
      for (const amenity of parsedAmenities) {
        if (typeof amenity.name !== 'string' || typeof amenity.photoUrl !== 'string') {
          return next(new InternalServerError("Each amenity must have name and photoUrl strings", 400));
        }
      }
    }



    const propertyAmenities = parsedAmenities.map(amenity => {
      return { name: amenity.name.trim(), photoUrl: amenity.photoUrl.trim() }
    });


    const propertyFeatures = parsedFeatures.map(feature => feature.trim());
    const propertyLocation = {
      lat: Number(parsedLocation.lat),

      lng: Number(parsedLocation.lng)
    };

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


    // Create property
    const updatedProperty = await Prisma.property.update({
      where: { id: propertyId },
      data: {
        status: "PENDING",
        rejectionReason: null,
        approvedBy: undefined,
        title,
        description,
        amenities: {
          create: propertyAmenities
        },
        // userId,
        category,
        city,
        country,
        neighborhood,
        state,
        features: propertyFeatures,
        location: propertyLocation,

        bedrooms: bedrooms,
        bathrooms: bathrooms,
        squareMeters: squareMeters,

        floors: Number(floors),
        price: {
            amount: Number(price.amount),
            currency: price.currency
          },

        ...(isFeatureProperty && {isFeatureProperty} ),
        ...(yearBuilt && {yearBuilt} ),
        ...(stage && {stage} ),
        ...(progress && {progress} ),
        ...(stagePrice.amount && {stagePrice: Number(stagePrice.amount)} ),
        ...(stagePrice.currency && {stagePrice: stagePrice.currency} ),
       

      },
    });


// 

    if (!updatedProperty) {
      return next(new InternalServerError("Failed to upload property", 401));
    };


    const fields = req.files as { [fieldname: string]: Express.Multer.File[] } || [];


    for (const [fieldName, files] of Object.entries(fields)) {
      const isPhoto = [
        "KITCHEN",
        "FLOOR_PLAN",
        "PRIMARY_ROOM",
        "OTHER",
        "FRONT_VIEW",
        "LIVING_ROOM",
      ].includes(fieldName);


      const photoType = isPhoto ? fieldName : undefined;



      for (const file of files) {

        // await mediaUploadQueue.add('upload', {
        //   propertyId: updatedProperty.id,
        //   file: {
        //     buffer: file.buffer,
        //     originalname: file.originalname,
        //   },
        //   meta: {
        //     // order: index, // optional
        //     type: isPhoto ? 'PHOTO' : fieldName, // VIDEO or TOUR_3D
        //     photoType: photoType || null,
        //   },
        // });


         await mediaUploadQueue.add('upload', {
          propertyId: updatedProperty.id,
          // file: {
          //   buffer: file.buffer,
          //   originalname: file.originalname,
          // },
           filePath: file.path,
          meta: {
            // order: index, // optional
            type: isPhoto ? 'PHOTO' : fieldName, // VIDEO or TOUR_3D
            photoType: photoType || null,
          },
        },{
          removeOnFail: {count: 3},
          removeOnComplete: true
        }
      );
      }

    }


    await deleteMatchingKeys(`property:${updatedProperty.id}:*`);
    await deleteMatchingKeys(`getAllProperties:*`);

    await deleteMatchingKeys(`getPropertiesByUser:${updatedProperty?.userId}:*`);



    new CustomResponse(200, true, "Property updated. Media is updating in background.", res, {
      propertyId: updatedProperty.id
    });


  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
    // console.log(error)

  }


};
