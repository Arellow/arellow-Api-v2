import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../lib/appError";



  const parse = (value: any, fallback: any) => {
      if (!value) return fallback;
      if (typeof value === "string") return JSON.parse(value);
      return value;
    };


export const parsePropertyBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

  

    req.body.features = parse(req.body.features, []);
    req.body.amenities = parse(req.body.amenities, []);
    req.body.price = parse(req.body.price, {});

    next();

  } catch (error) {
    next(new InternalServerError("Invalid JSON format", 400));
  }
};






export const parseProjectBody = ( req: Request,
  res: Response,
  next: NextFunction) => {

  try {

    req.body.features = parse(req.body.features, []);
    req.body.amenities = parse(req.body.amenities, []);
    req.body.price = parse(req.body.price, {});
    req.body.stagePrice = parse(req.body.stagePrice, {});

    req.body.is_Property_A_Project = true;

    next();

  } catch (error) {

    next(new InternalServerError("Invalid JSON format", 400));

  }

};




export const parseLandBody = (req: Request, res: Response, next: NextFunction) => {
  try {

    req.body.price = parse(req.body.price, {});
    req.body.squareMeters = parse(req.body.squareMeters, '');

    next();
  } catch (error) {
    next(new InternalServerError('Invalid JSON format', 400));
  }
};