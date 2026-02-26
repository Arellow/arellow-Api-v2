import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
import { deleteMatchingKeys } from "../../../lib/cache";

import { mediaUploadQueue } from "../../property/queues/media.queue";



export const createPartner = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const fields = req.files as { [fieldname: string]: Express.Multer.File[] } || [];

        const {
            description,
            businessName,
            businessAdress,
            email,
            phoneNumber,
            state,
            // website,

            isLandingPageFeature,

        } = req.body;


        // Create partner
        const newPartner = await Prisma.arellowPartner.create({
            data: {
                description,
                businessName,
                businessAdress,
                email,
                phoneNumber,
                state,
                // website,

                isLandingPageFeature,


                is_verified: (req.user?.role === "SUPER_ADMIN") ? true : false,
            },
        });


        if (!newPartner) {
            return next(new InternalServerError("Failed to create partner", 401));
        };


        for (const [fieldName, files] of Object.entries(fields)) {
            const isPhoto = [
                "PROOF_OF_ADDRESS",
                "CAC_CERT",
                "MEMORANDUM_AND_ARTICLE",
                "CAC_STATUS_REPORT",
                "PARTNER_BANNER",
            ].includes(fieldName);


            const photoType = isPhoto ? fieldName : undefined;



            for (const file of files) {

                await mediaUploadQueue.add('upload', {
                    propertyId: newPartner.id,
                    file: {
                        buffer: file.buffer,
                        originalname: file.originalname,
                        mimetype: file.mimetype
                    },
                    //    filePath: file.path,
                    meta: {
                        from: "PARTNER",
                        // order: index, // optional
                        type: isPhoto ? 'PHOTO' : fieldName, // VIDEO or TOUR_3D
                        photoType: photoType || null,
                    },
                }, {
                    removeOnFail: { count: 3 },
                    removeOnComplete: true
                }
                );
            }
        }


        const getPartners = `getPartners:*`

        await deleteMatchingKeys(getPartners);


        new CustomResponse(201, true, "Partner created. Media is uploading in background.", res, {
            partnerId: newPartner.id,
        });

    } catch (error: any) {
        // console.log({error: error?.response})
        next(new InternalServerError("Internal server error", 500));
    }

};
