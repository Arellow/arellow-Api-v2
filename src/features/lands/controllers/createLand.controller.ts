import { Request, Response, NextFunction } from 'express';
import { landService } from '../services/land.service';
import CustomResponse from '../../../utils/helpers/response.util';
import { InternalServerError } from '../../../lib/appError';

export const createLand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || [];

    const land = await landService.createLand({
      userId,
      body: req.body,
      files
    });

    return new CustomResponse(201, true, 'Land created. Media uploading in background.', res, {
      landId: land.id
    });
  } catch (error: any) {
    next(new InternalServerError(error?.message || 'Internal server error', 500));
  }
};