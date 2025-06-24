import { Request, Response, NextFunction } from "express";
import { PropertyService } from "../services/requestProperty";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from "../../../utils/helpers/response.util";
import { PropertyRequestDto } from "../dtos/preDto";

const propertyService = new PropertyService();


export const getAllPropertyRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const { page, limit } = req.query;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.getAllPropertyRequests(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 10
    );
    new CustomResponse(200, true, "Property requests fetched successfully", res, result);
  } catch (error) {
    console.error("Get all property requests error:", error);
    next(new InternalServerError("Failed to fetch property requests."));
  }
};

export const getPropertyRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  if (!id) {
    res.status(400).json({
      status: "failed",
      message: "Property request ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.getPropertyRequestById(id, userId);
    if (!result) {
      res.status(404).json({
        status: "failed",
        message: "Property request not found",
        succeeded: false,
      });
      return;
    }
    new CustomResponse(200, true, "Property request fetched successfully", res, result);
  } catch (error) {
    console.error("Get property request error:", error);
    next(new InternalServerError("Failed to fetch property request."));
  }
};

export const updatePropertyRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const { id } = req.params;
  const data: Partial<PropertyRequestDto> = req.body;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  if (!id) {
    res.status(400).json({
      status: "failed",
      message: "Property request ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.updatePropertyRequest(id, data, userId);
    new CustomResponse(200, true, "Property request updated successfully", res, result);
  } catch (error) {
    console.error("Update property request error:", error);
    next(new InternalServerError("Failed to update property request."));
  }
};

export const deletePropertyRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  if (!id) {
    res.status(400).json({
      status: "failed",
      message: "Property request ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    await propertyService.deletePropertyRequest(id, userId);
    new CustomResponse(200, true, "Property request deleted successfully", res);
  } catch (error) {
    console.error("Delete property request error:", error);
    next(new InternalServerError("Failed to delete property request."));
  }
};