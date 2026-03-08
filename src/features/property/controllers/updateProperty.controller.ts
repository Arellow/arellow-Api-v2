
import { NextFunction, Request, Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { propertyService } from "../services/property.service";




export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const property = await propertyService.updateProperty({
      propertyId: req.params.propertyId,
      user: req.user!,
      body: req.body,
      files: req.files as Record<string, Express.Multer.File[]>
    });

    new CustomResponse(
      200,
      true,
      "Property updated. Media updating in background.",
      res,
      { propertyId: property.id }
    );

  } catch (error) {
    next(error);
  }

};