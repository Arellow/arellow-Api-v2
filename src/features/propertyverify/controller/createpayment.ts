import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { InternalServerError } from '../../../lib/appError';
import { processImage } from '../../../utils/imagesprocess';
import { Prisma } from '../../../lib/prisma';
import { getDataUri } from '../../../middlewares/multer';
import { cloudinary } from '../../../configs/cloudinary';


export const createPropertyVerify = async (req: Request, res: Response, next: NextFunction) => {

  const { email, location, fullname, phonenumber , title} = req.body;

  let amount = 50000;
  if (location === "Abuja" || location === "Lagos") {
    amount = 150000;
  }


  try {

    if (!req.file) {
      return next(new InternalServerError("document not found", 404));
    }


    // const document = await processImage({
    //   folder: "property_veriification_container",
    //   image: req.file,
    //   photoType: "PROPERTYVERIFFICATION",
    //   type: "PHOTO"
    // });


    // if (!document) {
    //   return next(new InternalServerError("document upload failed", 404));
    // }


    const verifyRes = await Prisma.propertyVerify.create({
      data: {
        amount,
        location,
        title,
        contact: {
          email,
          phonenumber
        }

      }
    })





    const file = getDataUri(req.file);
    
          const result = await cloudinary.uploader.upload(file.content, {
          folder:  "property_veriification_container", 
        });
        
        await Prisma.userMedia.create({
        data: {
        type: "PHOTO",
        photoType: "PROPERTYVERIFFICATION",
        url: result.secure_url,
        publicId: result?.public_id,
        propertyVerifyId: verifyRes.id
        }});


    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        fullname,
        phonenumber,
        amount: amount * 100, // amount in kobo
        metadata: {
          fullname, phonenumber
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url } = response.data.data;


    return res.json({authorization_url,verifyRes })

    // return res.redirect(authorization_url);

  } catch (error) {
    // console.error('Paystack error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to initialize payment' });
  }
};
