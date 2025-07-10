import { Request, Response, NextFunction, RequestHandler } from "express";
import { ObjectSchema } from "joi";

export function parseArrayFields(fields: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    fields.forEach((field) => {
      if (req.body[field]) {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch {
          req.body[field] = (req.body[field] as string)
            .split(",")
            .map((item) => item.trim());
        }
      }
    });
    next();
  };
}



export function validateSchema(schema: ObjectSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {

    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      res.status(400).json({ status: "error", message: errorMessage });
      return;
    }
    next();
  };
}

