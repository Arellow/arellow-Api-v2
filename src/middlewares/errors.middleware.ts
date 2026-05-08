

import { Request, Response, NextFunction } from "express";
import logger from "./logger.middleware";
import CustomResponse from "../utils/helpers/response.util";
import { AppError } from "../lib/appError";
import { Prisma } from "../../generated/prisma/client";

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(error);

  if (error instanceof AppError) {
    new CustomResponse(error.statusCode, false, error.message, res);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    new CustomResponse(400, false, "Invalid or missing data in request", res);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      new CustomResponse(409, false, "A record with this value already exists", res);
    } else if (error.code === "P2025") {
      new CustomResponse(404, false, "Record not found", res);
    } else {
      new CustomResponse(400, false, `Database error: ${error.code}`, res);
    }
  } else if (error instanceof SyntaxError) {
    new CustomResponse(400, false, "Invalid JSON in request body", res);
  } else {
    new CustomResponse(500, false, error.message || "Something went wrong", res);
  }
}
