import { Request, Response, NextFunction } from "express";
import { RequestPropertyService } from "../services/request";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from '../../../utils/helpers/response.util'
import { createPropertyRequestMailOptions } from "../../../utils/mailer";
import { nodeMailerController } from "../../../utils/nodemailer";
import dotenv from 'dotenv'
dotenv.config();
const projectService = new RequestPropertyService();

export const createPropertyRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const {
      name,
      email,
      phone,
      category,
      type,
      furnishingStatus,
      country,
      city,
      numberOfBedrooms,
      numberOfBathrooms,
      budget,
      additionalNote,
    } = req.body;

    // Basic validation
    if (!name || !email || !phone || !category || !type || !furnishingStatus || !country || !city || !numberOfBedrooms || !numberOfBathrooms || !budget) {
      res.status(400).json({
        status: "failed",
        message: "All required fields must be provided",
        succeeded: false,
      });
      return;
    }

    const result = await projectService.createPropertyRequest(
      name,
      email,
      phone,
      category,
      type,
      furnishingStatus,
      country,
      city,
      numberOfBedrooms,
      numberOfBathrooms,
      budget,
      additionalNote || null,
      userId
    );

    // Email to Admin
    const adminEmail = process.env.ADMIN_EMAIL || "uche.ali.tech@gmail.com";
    const adminMailOptions = await createPropertyRequestMailOptions(
      adminEmail,
      name,
      email,
      phone,
      category,
      type,
      furnishingStatus,
      country,
      city,
      numberOfBedrooms,
      numberOfBathrooms,
      budget,
      additionalNote,
      true
    );
    await nodeMailerController(adminMailOptions);

    // Email to User
    const userMailOptions = await createPropertyRequestMailOptions(
      email,
      name,
      email,
      phone,
      category,
      type,
      furnishingStatus,
      country,
      city,
      numberOfBedrooms,
      numberOfBathrooms,
      budget,
      additionalNote
    );
    await nodeMailerController(userMailOptions);

    new CustomResponse(201, true, "Property request created successfully", res, result);
  } catch (error) {
    console.error("Property request creation error:", error);
    next(new InternalServerError("Failed to create property request."));
  }
};