import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import { mediaUploadQueue } from "../../property/queues/media.queue";
import { deleteMatchingKeys } from "../../../lib/cache";
import CustomResponse from "../../../utils/helpers/response.util";

type Amenity = {
  name: string;
  photoUrl: string;
}

export const createProject = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const userId = req.user?.id!;
    const is_user_verified = req.user?.is_verified!;

    if (!is_user_verified) {
      return next(new InternalServerError("Unverify email please check mail and verify account", 401));
    }

    const fields = req.files as { [fieldname: string]: Express.Multer.File[] } || [];


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




    // Create property
    const newProperty = await Prisma.property.create({
      data: {
        title,
        description,
        amenities: {
          create: propertyAmenities
        },
        userId,
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
        yearBuilt: Number(yearBuilt),
        is_Property_A_Project: true,
        isFeatureProperty: true,
        stage,
        progress,
        stagePrice: {
          amount: Number(stagePrice.amount),
          currency: stagePrice.currency
        }
      },
    });

    if (!newProperty) {
      return next(new InternalServerError("Failed to upload property", 401));
    };


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

        await mediaUploadQueue.add('upload', {
          propertyId: newProperty.id,
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



    await deleteMatchingKeys(`getAllProperties:*`);
    await deleteMatchingKeys(`getPropertiesByUser:${userId}:*`);
   

    new CustomResponse(201, true, "Property created. Media is uploading in background.", res, {
      propertyId: newProperty.id,
      // isFeatureProperty,
      //  yearBuilt,
      // stage  ,
      // progress ,
      // stagePrice 
    });


  } catch (error) {
    console.log({error})
    next(new InternalServerError("Internal server error", 500));

  }


};
