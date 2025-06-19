import { Request, Response, NextFunction } from "express";
import { PropertyService } from "../services/likeProperty";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from "../../../utils/helpers/response.util";

const propertyService = new PropertyService();

export const toggleProjectLike = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const { prodId } = req.body; 

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  if (!prodId) {
    res.status(400).json({
      status: "failed",
      message: "Project ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.toggleProjectLike(prodId, userId);
    new CustomResponse(201, true, result.isLiked ? "post like" : "post deleted", res, result);
  } catch (error) {
    console.error("Toggle project like error:", error);
    next(new InternalServerError("Failed to toggle project like."));
  }
};

// export const getUserLikedProperties = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const userId = req.user?.id as string;

//   if (!userId) {
//     res.status(401).json({
//       status: "failed",
//       message: "Unauthorized access",
//       succeeded: false,
//     });
//     return;
//   }

//   try {
//     const result = await propertyService.getUserLikedProperties(userId);
//     new CustomResponse(200, true, "User liked properties fetched successfully", res, result);
//   } catch (error) {
//     console.error("Get user liked properties error:", error);
//     next(new InternalServerError("Failed to fetch user liked properties."));
//   }
// };

// export const getProjectLikedUsers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { prodId } = req.params;

//   if (!prodId) {
//     res.status(400).json({
//       status: "failed",
//       message: "Project ID is required",
//       succeeded: false,
//     });
//     return;
//   }

//   try {
//     const result = await propertyService.getProjectLikedUsers(prodId);
//     new CustomResponse(200, true, "Project liked users fetched successfully", res, result);
//   } catch (error) {
//     console.error("Get project liked users error:", error);
//     next(new InternalServerError("Failed to fetch project liked users."));
//   }
// };