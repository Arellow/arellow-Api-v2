
import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";


import { mediaUploadQueue } from "../queues/media.queue";
import { cloudinary } from "../../../configs/cloudinary";
import { deleteMatchingKeys } from "../../../lib/cache";
import { getPropertyLocation, getPropertyLocationAlternative } from "../../../lib/propertyLocation";

type Amenity = {
  name: string;
  photoUrl: string;
}



export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { propertyId } = req.params;
   

    const {
      title,
      description,
      bathrooms,
      bedrooms,
      category,
      city,
      country,
      floors,
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

    const getLocation =  await getPropertyLocation({address: neighborhood });
            let propertyLocation: { lat: number, lng: number } = {lat: 9.6000359, lng:7.9999721};
            
            if (getLocation.status !== 'OK' || getLocation.results.length === 0) {
               const response = await getPropertyLocationAlternative({city});
                 const data = response.data[0];
    
                if (data) {
                    propertyLocation = { lat: Number(data.lat), lng: Number(data.lon)}; 
                    }
    
    
            } else {
                const userlocation = getLocation.results[0].geometry.location;
                
                 propertyLocation = { lat: Number(userlocation.lat), lng: Number(userlocation.lng)};
        
    
            }
    


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


     let points = 10;
    if(property.state.toLowerCase() == "lagos" || property.state.toLowerCase() == "enugu" || property.state.toLowerCase() == "abuja" ){
      points = 5
    }

    await Prisma.rewardHistory.create({
      data: {
        userId: property.userId,
        points,
        reason: "ArellowPoints Used",
        type: "DEBIT"
      }
    })


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
