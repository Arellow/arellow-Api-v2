import { Request, Response, NextFunction } from "express";
import { PropertyService } from "./service";
import { InternalServerError } from "../../lib/appError";
import CustomResponse from "../../utils/helpers/response.util";
import { PreQualificationDto } from "./dto";
import { createPreQualificationMailOptions } from "../../utils/mailer";
import { nodeMailerController } from "../../utils/nodemailer";

const propertyService = new PropertyService();

export const createPreQualification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const data: PreQualificationDto = req.body;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.createPreQualification(data, userId);
    // Email options for the user
    // const userMailOptions = await createPreQualificationMailOptions(
    //   data.email,
    //   data.name,
    //   data.email,
    //   data.phone,
    //   data.state,
    //   data.city,
    //   data.property_category,
    //   data.neighbourhood ,
    //   data.monthly_budget,
    //   data.down_payment_goal,
    //   false 
    // );
    // await nodeMailerController(userMailOptions);

    // // Email options for the admin
    // const adminMailOptions = await createPreQualificationMailOptions(
    //   process.env.ADMIN_EMAIL || "",
    //   data.name,
    //   data.email,
    //   data.phone,
    //   data.state,
    //   data.city,
    //   data.property_category,
    //   data.neighbourhood,
    //   data.monthly_budget,
    //   data.down_payment_goal,
    //   true 
    // );
    // await nodeMailerController(adminMailOptions);
 

    new CustomResponse(201, true, "Pre-qualification request created successfully", res, result);
  } catch (error) {
    console.error("Create pre-qualification request error:", error);
    next(new InternalServerError("Failed to create pre-qualification request."));
  }
};

export const getAllPreQualifications = async (
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
    const result = await propertyService.getAllPreQualifications(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 10
    );
    new CustomResponse(200, true, "Pre-qualification requests fetched successfully", res, result);
  } catch (error) {
    console.error("Get all pre-qualification requests error:", error);
    next(new InternalServerError("Failed to fetch pre-qualification requests."));
  }
};

export const getPreQualificationById = async (
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
      message: "Pre-qualification request ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.getPreQualificationById(id, userId);
    if (!result) {
      res.status(404).json({
        status: "failed",
        message: "Pre-qualification request not found",
        succeeded: false,
      });
      return;
    }
    new CustomResponse(200, true, "Pre-qualification request fetched successfully", res, result);
  } catch (error) {
    console.error("Get pre-qualification request error:", error);
    next(new InternalServerError("Failed to fetch pre-qualification request."));
  }
};

export const updatePreQualification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id as string;
  const { id } = req.params;
  const data: Partial<PreQualificationDto> = req.body;

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
      message: "Pre-qualification request ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    const result = await propertyService.updatePreQualification(id, data, userId);
    new CustomResponse(200, true, "Pre-qualification request updated successfully", res, result);
  } catch (error) {
    console.error("Update pre-qualification request error:", error);
    next(new InternalServerError("Failed to update pre-qualification request."));
  }
};

export const deletePreQualification = async (
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
      message: "Pre-qualification request ID is required",
      succeeded: false,
    });
    return;
  }

  try {
    await propertyService.deletePreQualification(id, userId);
    new CustomResponse(200, true, "Pre-qualification request deleted successfully", res);
  } catch (error) {
    console.error("Delete pre-qualification request error:", error);
    next(new InternalServerError("Failed to delete pre-qualification request."));
  }
};