import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/fetchedProperties";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from "../../../utils/helpers/response.util";


const projectService = new ProjectService();

export const calculateProjectMortgage = async (
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
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({
        status: "failed",
        message: "Project ID is required",
        succeeded: false,
      });
      return;
    }

    // Extract and validate down_payment from request body
    const downPayment = req.body?.down_payment;
    if (typeof downPayment === "undefined") {
      res.status(400).json({
        status: "failed",
        message: "Down payment is required",
        succeeded: false,
      });
      return;
    }
    const downPaymentNum = Number(downPayment);
    if (isNaN(downPaymentNum)) {
      res.status(400).json({
        status: "failed",
        message: "Down payment must be a valid number",
        succeeded: false,
      });
      return;
    }

    const mortgage = await projectService.calculateMortgage(id, downPaymentNum);
    new CustomResponse(200, true, "Mortgage calculated successfully", res, mortgage);
  } catch (error) {
    console.error("Mortgage calculation error:", error);
    next(new InternalServerError("Failed to calculate mortgage."));
  }
};