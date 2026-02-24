import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { InternalServerError } from '../../../lib/appError';
import { Prisma } from '../../../lib/prisma';
import { getDataUri } from '../../../middlewares/multer';
import { cloudinary } from '../../../configs/cloudinary';


export const createPropertyVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (!idempotencyKey) {
    return res.status(400).json({
      message: "Idempotency-Key header required",
    });
  }

  const { email, location, fullname, phonenumber, title } = req.body;

  let amount = 50000;
  if (location === "Abuja" || location === "Lagos") {
    amount = 150000;
  }

  let uploadResult: any = null; 
  let dbCommitted = false;


  try {
  
    const existing = await Prisma.propertyVerify.findUnique({
      where: { idempotencyKey },
    });

    if (existing?.paymentReference) {
      return res.redirect(`https://checkout.paystack.com/${existing.paymentReference}`)
      
    }

    if (!req.file) {
      return next(new InternalServerError("document not found", 404));
    }

  
    const file = getDataUri(req.file);
     uploadResult = await cloudinary.uploader.upload(file.content, {
      folder: "property_verification_container",
    });


    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { authorization_url, reference } = paystackRes.data.data;


    await Prisma.$transaction(async (tx) => {
      const property = await tx.propertyVerify.create({
        data: {
          amount,
          location,
          title,
          contact: {
            email,
            phonenumber,
            fullname
          },
          paymentReference: reference,
          idempotencyKey, // ✅ store it
        },
      });

      await tx.userMedia.create({
        data: {
          type: "PHOTO",
          photoType: "PROPERTYVERIFICATION",
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          propertyVerifyId: property.id,
        },
      });

       dbCommitted = true;
    });

    return res.redirect(authorization_url);
    //  return res.json({authorization_url});

  } catch (error: any) {

    if (error.code === "P2002") {
      const existing = await Prisma.propertyVerify.findUnique({
        where: { idempotencyKey },
      });

       if (existing?.paymentReference) {
       return res.redirect(`https://checkout.paystack.com/${existing.paymentReference}`)
       }
    }

     if (!dbCommitted && uploadResult?.public_id) {
 
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    return res.status(500).json({ message: "Failed" });
  }
};