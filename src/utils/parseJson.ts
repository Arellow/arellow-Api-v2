import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../lib/appError";


export const parsePropertyBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const parse = (value: any, fallback: any) => {
      if (!value) return fallback;
      if (typeof value === "string") return JSON.parse(value);
      return value;
    };

    req.body.features = parse(req.body.features, []);
    req.body.amenities = parse(req.body.amenities, []);
    req.body.price = parse(req.body.price, {});

    next();

  } catch (error) {
    next(new InternalServerError("Invalid JSON format", 400));
  }
};