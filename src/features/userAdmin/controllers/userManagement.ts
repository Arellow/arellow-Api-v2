import { Request, Response, NextFunction } from "express";
import { ListingService } from "../services/userManagement";
import { ListingQueryDto } from "../dtos/userManagement";
import CustomResponse from "../../../utils/helpers/response.util";

const listingService = new ListingService();

export const getUserListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string; 
  const query = req.query as ListingQueryDto;

  try {
    const listings = await listingService.getUserListings(userId, query);
    new CustomResponse(200, true, "User listings fetched successfully", res, listings);
  } catch (error) {
    console.error("[getUserListings] error:", error);
    next(error);
  }
};

// export const getPropertyDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const  id  = req.params.id as string; 

//   try {
//     const property = await listingService.getPropertyDetails(id );
//     res.status(200).json({
//       status: "success",
//       data: property,
//     });
//   } catch (error) {
//     console.error("[getPropertyDetails] error:", error);
//     next(error);
//   }
// };

// export const deleteProperty = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { id } = req.params

//   try {
//     await listingService.deleteProperty( id );
//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   } catch (error) {
//     console.error("[deleteProperty] error:", error);
//     next(error);
//   }
// };

