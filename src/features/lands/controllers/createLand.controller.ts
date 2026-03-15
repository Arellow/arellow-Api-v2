import { Request, Response, NextFunction } from 'express';
import { landService } from '../services/land.service';
import CustomResponse from '../../../utils/helpers/response.util';
import { InternalServerError } from '../../../lib/appError';
import { Prisma } from '../../../lib/prisma';

export const createLand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id!;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || [];


       const partner = await Prisma.arellowPartner.findUnique({where: {id: userId}});

    
         if (!partner) {
          return next( new InternalServerError("Invalid partner", 401));
        }
         if (partner.suspended) {
          return next(new InternalServerError("Partner was suspended", 401));
        }
    
        
    const land = await landService.createLand({
      userId,
      body: req.body,
      files,
      approvedById: req.user?.id!

    });

    return new CustomResponse(201, true, 'Land created. Media uploading in background.', res, {
      landId: land.id
    });
  

    
  } catch (error: any) {
    next(new InternalServerError(error?.message || 'Internal server error', 500));
  }
};