

import { Request, Response, NextFunction } from "express";
import logger from "./logger.middleware";
import CustomResponse from "../utils/helpers/response.util";
import { AppError } from "../lib/appError"; 

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(error);

  if (error instanceof AppError) {
    // Custom handled errors
    new CustomResponse(error.statusCode, false, error.message, res);
  } else {
    // Unhandled errors (like thrown by native code, etc.)
    new CustomResponse(500, false, "Something went wrong", res);
  }
}
