import { NextFunction, Request, Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { propertyService } from "../../property/services/property.service";


export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const project = await propertyService.createProject({
      user: req.user!,
      body: req.body,
      files: req.files as Record<string, Express.Multer.File[]>
    });

    new CustomResponse(
      201,
      true,
      "Project created. Media uploading in background.",
      res,
      { propertyId: project.id }
    );

  } catch (error) {

    next(error);

  }

};