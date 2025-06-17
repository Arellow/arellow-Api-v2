import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from "../../../utils/helpers/response.util";
import { ProjectService } from "../services/calculate";
const projectService = new ProjectService();
export const calculateCustomMortgage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const { homeLocation, homePrice, downPayment, saveAndContinue } = req.body;

    // Basic validation
    if (!homeLocation || !homePrice || !downPayment) {
      res.status(400).json({
        status: "failed",
        message: "homeLocation, homePrice, and downPayment are required",
        succeeded: false,
      });
      return;
    }

    if (saveAndContinue) {
      // Save as draft
      const result = await projectService.saveMortgageDraft(
        homeLocation,
        Number(homePrice),
        Number(downPayment),
        userId
      );
      new CustomResponse(200, true, "Mortgage draft saved, you can continue later", res, result);
    } else {
      // Calculate full mortgage
      const result = await projectService.calculateCustomMortgage(
        homeLocation,
        Number(homePrice),
        Number(downPayment)
      );
      new CustomResponse(200, true, "Mortgage calculated successfully", res, result);
    }
  } catch (error) {
    console.error("Custom mortgage calculation error:", error);
    next(new InternalServerError("Failed to calculate mortgage."));
  }
};