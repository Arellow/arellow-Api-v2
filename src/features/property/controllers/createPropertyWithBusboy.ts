import { NextFunction, Request, Response } from "express";
// import CustomResponse from "../../../utils/helpers/response.util";

import Busboy from "busboy";
import { propertyService } from "../services/property.service";
import { mediaUploadQueueBusboy } from "../../../services/queues/media.queue";
import { ALLOWED_MEDIA_FIELDS, createPropertySchema, MediaField, UploadFile } from "../routes/property.validate";
import { parseFormData } from "../createparsedata";
import { validateRoute } from "../../../middlewares/propertyParsingAndValidation";
// import { mediaUploadQueue } from "../services/media.service";




export const createPropertyWithBusboy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

    try {
    const { body, files } = await parseFormData(req);


      const validatedBody = validateRoute(createPropertySchema, body);
// validateSchema(createPropertySchema)

    const property = await propertyService.createPropertyBusBoy({
      user: req.user!,
      body: validatedBody,
    });

    if (files.length) {
      await mediaUploadQueueBusboy.addBulk(
        files.map((file) => ({
          name: "upload",
          data: { propertyId: property.id, file },
        }))
      );
    }

    res.status(201).json({
      message: "Property created, media uploading in background",
      propertyId: property.id,
    });
  } catch (err) {
    next(err);
  }
};





