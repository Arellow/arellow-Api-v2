import { Request, Response, NextFunction } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { Prisma } from "../../../lib/prisma";

export class DeleteAccountController {
  static async deleteaccount(req: Request, res: Response, next: NextFunction) {
   const id = req.user?.id!
    try {

        await Prisma.user.delete({
            where: {id}
        })
     

      new CustomResponse(
        200,
        true,
        "Account deleted successfully",
        res,
        {}
      );

    } catch (error) {
      next(error);
    }
  }
}
