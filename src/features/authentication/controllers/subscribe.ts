import { Request, Response, NextFunction } from "express";
import { SubscribeService } from "../services/subscribe";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError } from "../../../lib/appError";
import { trimObjectKeys } from "../../../utils/trim";

export class SubscribeController {
  constructor(private subscribeService: SubscribeService) {}

  subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      trimObjectKeys(req.body);
    } catch (err) {
      console.error("Trim keys failed:", err);
      throw new BadRequestError("Failed to sanitize input keys");
    }

    try {
      const { email, phone } = req.body;

      if (!email && !phone) {
        throw new BadRequestError("Email or phone number is required");
      }

      if (email && typeof email !== "string") {
        throw new BadRequestError("Email must be a string");
      }

      if (phone && typeof phone !== "string") {
        throw new BadRequestError("Phone number must be a string");
      }

      const result = await this.subscribeService.subscribe(email, phone);
      new CustomResponse(
        200,
        true,
        "Subscription successful",
        res,
        result
      );
    } catch (error) {
      next(error);
    }
  };
}
