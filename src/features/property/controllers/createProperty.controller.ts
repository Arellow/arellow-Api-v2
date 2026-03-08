import { NextFunction, Request, Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { propertyService } from "../services/property.service";


export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {


    const property = await propertyService.createProperty({
      user: req.user!,
      body: req.body,
      files: req.files as Record<string, Express.Multer.File[]>
    });

    new CustomResponse(
      201,
      true,
      "Property created. Media uploading in background.",
      res,
      { propertyId: property.id }
    );

  } catch (error) {
    next(error);
  }

};