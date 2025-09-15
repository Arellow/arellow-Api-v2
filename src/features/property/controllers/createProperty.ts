import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
import { mediaUploadQueue } from "../queues/media.queue";
import { deleteMatchingKeys } from "../../../lib/cache";

import { getPropertyLocation, getPropertyLocationAlternative } from "../../../lib/propertyLocation";

type Amenity = {
    name: string;
    photoUrl: string; 
}


export const createProperty = async (req: Request, res: Response, next: NextFunction)=> {

    try {

        const userId = req.user?.id!;

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
            // location,
            neighborhood,
            price,
            squareMeters,
            state,
            features,
            amenities,
            yearBuilt
        } = req.body;

        const parsedFeatures: string[] = typeof features === 'string' ? JSON.parse(features) : features;
        const parsedAmenities: Amenity[] = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        // const parsedLocation: { lat: string, lng: string } = typeof location === 'string' ? JSON.parse(location) : location;
        const parsedPrice: { amount: number, currency: string } = typeof price === 'string' ? JSON.parse(price) : price;

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
        const propertyPrice = { amount: Number(parsedPrice.amount), currency: parsedPrice.currency};
        
        
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

                bedrooms: Number(bedrooms),
                bathrooms: Number(bathrooms),
                squareMeters: squareMeters,

                floors: Number(floors),
                price: propertyPrice,
                yearBuilt: Number(yearBuilt),
                is_Property_A_Project: false,
                isFeatureProperty: (req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN") ? true : false,
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


        const adminPermission = await Prisma.adminPermission.findUnique({
            where: { userId },
        });

        if (adminPermission && adminPermission.action.length) {

            const hasAccess = adminPermission.action.some((role) =>
                ["PROPERTY"].includes(role)
            );
            if (!hasAccess) {
                await Prisma.property.update({
                    where: { id: newProperty.id },
                    data: {
                        status: 'APPROVED',
                        rejectionReason: null,
                        approvedBy: { connect: { id: req.user?.id! } },
                    },
                });
            }

        }


        await deleteMatchingKeys(`getAllProperties:*`);
        await deleteMatchingKeys(`getPropertiesByUser:${userId}:*`);

        new CustomResponse(201, true, "Property created. Media is uploading in background.", res, {
              propertyId: newProperty.id,
            
        });
   


    } catch (error:any) {
        console.log({error: error?.response})
        next(new InternalServerError("Internal server error", 500));
    }

};
