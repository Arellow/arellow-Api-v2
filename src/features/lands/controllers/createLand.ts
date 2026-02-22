import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
// import { mediaUploadQueue } from "../queues/media.queue";
import { deleteMatchingKeys } from "../../../lib/cache";

import { getPropertyLocation, getPropertyLocationAlternative } from "../../../lib/propertyLocation";
import { mediaUploadQueue } from "../../property/queues/media.queue";



export const createLand = async (req: Request, res: Response, next: NextFunction)=> {

    try {

        const userId = req.user?.id!;

        const fields = req.files as { [fieldname: string]: Express.Multer.File[] } || [];


        const {
            title,
            description,
            category,
            city,
            country,
            state,
            neighborhood,
            price,
            squareMeters,
           
        } = req.body;


        const parsedPrice: { amount: number, currency: string } = typeof price === 'string' ? JSON.parse(price) : price;

        // Basic validation
        if (!title || !description) {
            return next(new InternalServerError("Title and description are required", 400));
        }

        
        const propertyPrice = { amount: Number(parsedPrice.amount), currency: parsedPrice.currency};
        

          const getLocation = await getPropertyLocation({ address: neighborhood });
            let propertyLocation: { lat: number, lng: number } = { lat: 9.6000359, lng: 7.9999721 };
        
            if (getLocation.status !== 'OK' || getLocation?.results?.length === 0) {
              const response = await getPropertyLocationAlternative({ city });
        
              if (response && response?.data && response?.data.lenth && response?.data[0]) {
                const data = response.data[0];
        
                propertyLocation = { lat: Number(data.lat), lng: Number(data.lon) };
        
              }
        
        
            } else {
        
              if (getLocation && getLocation?.results && getLocation.results.length && getLocation.results[0]) {
                const userlocation = getLocation.results[0].geometry.location;
        
                propertyLocation = { lat: Number(userlocation.lat), lng: Number(userlocation.lng) };
        
              }
        
            }
        
        


        // Create property
        const newLand = await Prisma.lands.create({
            data: {
                title,
                description,
                
                userId,
                category,
                city,
                country,
                neighborhood,
                state,
                location: propertyLocation,

                squareMeters: squareMeters,

                price: propertyPrice,
                status: "APPROVED",
                salesStatus: "SELLING"

            },
        });


        if (!newLand) {
          return next(new InternalServerError("Failed to upload land", 401));
        };


        for (const [fieldName, files] of Object.entries(fields)) {
          const isPhoto = [
            "LANDS",
          ].includes(fieldName);


          const photoType = isPhoto ? fieldName : undefined;



          for (const file of files) {

            await mediaUploadQueue.add('upload', {
              propertyId: newLand.id,
              file: {
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype
              },
            //    filePath: file.path,
              meta: {
                from: "LANDS",
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
            if (hasAccess) {
                await Prisma.property.update({
                    where: { id: newLand.id },
                    data: {
                        status: 'APPROVED',
                        rejectionReason: null,
                        approvedBy: { connect: { id: req.user?.id! } },
                    },
                });
            }

        }

    
    
    const getLandsByUser = `getLandsByUser:${userId}`
 
    await deleteMatchingKeys(getLandsByUser);
 

        new CustomResponse(201, true, "Property created. Media is uploading in background.", res, {
              landId: newLand.id,
            
        });
   


    } catch (error:any) {
        // console.log({error: error?.response})
        next(new InternalServerError("Internal server error", 500));
    }

};
