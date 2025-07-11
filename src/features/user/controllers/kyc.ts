import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import { Kyc, KycDocumentType, KycStatus, Prisma as prisma } from "@prisma/client";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { getDataUri } from "../../../middlewares/multer";
import axios from "axios";


interface IRequest {
    documentType:  KycDocumentType,
     documentNumber:  string

}



export const createKyc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { documentType, documentNumber } = req.body as IRequest;

 

  try {

        const userId = req.user?.id!;
       
        const kyc = await Prisma.kyc.findUnique({
            where: { userId }
        });


        if (kyc && kyc.status == 'VERIFIED') {
            return next(new InternalServerError("Credential was verify", 403));
        }

        if (kyc && kyc.status == 'PENDING') {
            return next(new InternalServerError("Verification still in process", 403));
        }

        if(kyc){
            // allso delete avatar
            await Prisma.kyc.deleteMany({
            where: { userId }
        });
        }


    if (!req.file) {
      return next(new InternalServerError('Face recognition is required', 401));
    }

    const fileUri = getDataUri(req.file as any);
    if (!fileUri) {
      return next(new InternalServerError('Invalid file provided', 400));
    }

    const base64 = fileUri.content.split(',')[1]; 

    const options = {
      method: 'POST',
      url: 'https://api.qoreid.com/v1/ng/identities/face-verification/nin',
    //  url: 'https://sandbox.qoreid.com/v1/ng/identities/face-verification/nin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.QOREID_API_KEY}`, 
      },
      data: {
        idNumber: documentNumber,
        photoBase64: base64,
      },
    };

     console.log("----------------------------------")
     console.log({QOREID_API_KEY: process.env.QOREID_API_KEY})

    // const qoreRes = await axios.request(options);

       await  axios.request(options)
     .then(res => console.log(res.data))
  .catch(error => {
    console.log(error.response?.data?.message)

    //  return next(new InternalServerError(err.message, 401));
  });

 console.log("----------------------------------")

   
    // if (!qoreRes.data?.matched) {
    //   return next(new InternalServerError('Face does not match NIN', 403));
    // }

    const documentPhoto = fileUri;

    return new CustomResponse(200, true, 'Face verification passed', res, {
      documentPhoto,
      documentType,
      documentNumber,
    //   qoreidResponse: qoreRes.data,
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || 'Face verification failed';
    return next(new InternalServerError(message, status));
  }
};



// export const createKyc = async (req: Request, res: Response, next: NextFunction) => {

//     const { documentType, documentNumber } = req.body as IResquest;

//     try {

//           let documentPhoto;


//           if (!req.file) {
//             return next(new InternalServerError('Face recognition is required', 401));
//             }

//     const fileUri = getDataUri(req.file as any);
//     if (!fileUri) {
//       return next(new InternalServerError('Invalid file provided', 400));
//     }

//     const base64 = fileUri.content.split(',')[1];






//     const options = {
//   method: 'POST',
//   url: 'https://api.qoreid.com/v1/ng/identities/face-verification/nin',
//   headers: {
//     accept: 'application/json',
//     'content-type': 'application/json',
//     authorization: 'Bearer gggggg'
//   },
//   data: {idNumber: 'ddd', photoBase64: 'ffffff'}
// };









//         if(req?.file){
//             const fileUri = getDataUri(req.file as any);

//             if(!fileUri){
//                 return next(new InternalServerError("Face recognition is required", 401));
//             }


//             const options = {
//   method: 'POST',
//   url: 'https://api.qoreid.com/v1/ng/identities/face-verification/nin',
//   headers: {accept: 'application/json', 'content-type': 'application/json'},
//   data: {idNumber: 'ddd', photoBase64: 'ffffff'}
// };

//      axios.request(options)
//      .then(res => console.log(res.data))
//   .catch(err => {

//      return next(new InternalServerError(err.message, 401));
//   });

           


//             documentPhoto = fileUri

//         } else {
            
//         return next(new InternalServerError("Face recognition is required", 401));
            
//         }


//         // const userId = req.user?.id!;
//         // const is_user_verified = req.user?.is_verified!;



//         // if (!is_user_verified) {
//         //     return next(new InternalServerError("Please verify your email to continue this process.", 401));
//         // }


//         // const kyc = await Prisma.kyc.findUnique({
//         //     where: { userId }
//         // });


//         // if (kyc && kyc.status == 'VERIFIED') {
//         //     return next(new InternalServerError("Credential was verify", 403));
//         // }

//         // if (kyc && kyc.status == 'PENDING') {
//         //     return next(new InternalServerError("Verification still in process", 403));
//         // }

//         // if(kyc){
//         //     // allso delete avatar
//         //     await Prisma.kyc.deleteMany({
//         //     where: { userId }
//         // });
//         // }

        


//         // const documentPhoto = "";


//         // await Prisma.kyc.create({
//         //     data: {
//         //         userId,
//         //         documentType,
//         //         documentPhoto,
//         //         documentNumber,
//         //         status: "PENDING",


//         //     }
//         // });





//         // await redis.del("kyc:*");

//         new CustomResponse(200, true, "successfully", res, documentPhoto);
//     } catch (error) {
//         // next(new InternalServerError("Internal server error", 500));
//         next(error)
//     }


// }


export const kycDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const cacheKey = `kyc:${id}`;

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
        const property = await Prisma.kyc.findUnique({
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

export const userKycs = async (req: Request, res: Response, next: NextFunction) => {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const cacheKey = `kyc:${page}:${limit}:${search}`;

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
                    { status: upperSearch as KycStatus }, // enum match 
                    { documentNumber: { contains: search, mode: "insensitive" }, }
                ].filter(Boolean) as prisma.KycWhereInput[],
            }
            : {};

        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.kyc.findMany({
                    where: filters,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.kyc.count({ where: filters }),
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



export const changeKycStatus = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
     const { status } = req.body;

    try {

        const kyc = await Prisma.kyc.findUnique({
            where: { id }
        });


        if(!kyc){
            return next(new InternalServerError("Kyc invalid", 403));
        }


        if (status == 'VERIFIED') {
            // return next(new InternalServerError("Credential was verify", 403));
        }

        if (status == 'FAILED') {
            // return next(new InternalServerError("Verification still in process", 403));
        }

        await Prisma.kyc.update({
           where: { id },
            data: {
                status
            }
        });

         await deleteMatchingKeys("kyc:*");

        new CustomResponse(200, true, "successfully", res,);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


}