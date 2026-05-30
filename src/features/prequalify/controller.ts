import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../../lib/appError";
import CustomResponse from "../../utils/helpers/response.util";
import { createPrequalificationMailOptions } from "../../utils/mailer";
import { mailController } from "../../utils/nodemailer";
import { Prisma } from "../../lib/prisma";
import { deleteMatchingKeys, swrCache } from "../../lib/cache";



export const createPreQualification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id!;

  const {
    bank_name,
    city,
    country,
    down_payment_goal,
    email,
    fullname,
    home_address,
    monthly_budget,
    neighbourhood,
    occupation,
    phonenumber,
    state,
    employer_name,
    level_of_employment,
  }: {
    bank_name: string; city: string; country: string;
    down_payment_goal: { currency: string; amount: number };
    email: string; fullname: string; home_address: string;
    monthly_budget: { currency: string; amount: number };
    neighbourhood: string; occupation: string; phonenumber: string; state: string;
    employer_name?: string; level_of_employment?: string;
  } = req.body;

  try {
    const [, userMailOptions] = await Promise.all([
      Prisma.preQualification.create({
        data: {
          bank_name, city, country, down_payment_goal, email, fullname,
          home_address, monthly_budget, neighbourhood, occupation,
          phonenumber, state, employer_name, level_of_employment, userId,
        },
      }),
      createPrequalificationMailOptions({ email, fullname, isAdmin: false }),
    ]);

    mailController({ from: "noreply@arellow.com", ...userMailOptions });

    await deleteMatchingKeys("getPreQualifications");

    new CustomResponse(201, true, "Pre-Qualification submitted successfully", res);
  } catch (error) {
    next(new InternalServerError("Pre-Qualification request failed", 500));
  }
};



export const preQualificationDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  // const user = req?.user

  // const cacheKey = `PreQualification:${id}:${user}`;

  // const cached = await redis.get(cacheKey);
  // if (cached) {
  //   res.status(200).json({
  //     success: true,
  //     message: "successfully. from cache",
  //     data: JSON.parse(cached)
  //   });
  //   return
  // }

  try {

   


    const response = await Prisma.preQualification.findUnique({
      where: { id },
      // include: {
      //   user: {
      //     omit: {
      //       password: true,


      //     }
      //   }
      // }
    });


    if (!response) {
      return next(new InternalServerError("Pre qualification not found", 404));
    }


    new CustomResponse(200, true, "successfully", res, response);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }


};


export const preQualificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const existing = await Prisma.preQualification.findUnique({ where: { id } });
    if (!existing) {
      return next(new InternalServerError("Pre qualification not found", 404));
    }

    await Promise.all([
      Prisma.preQualification.update({ where: { id }, data: { status } }),
      deleteMatchingKeys("getPreQualifications"),
    ]);

    new CustomResponse(200, true, "Status updated successfully", res);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};




export const getPreQualifications = async (req: Request, res: Response, next: NextFunction) => {
  const { page = "1", limit = "10" } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  try {
    const cacheKey = `getPreQualifications:${pageNumber}:${pageSize}`;

    const result = await swrCache(cacheKey, async () => {
      const [prequalification, total] = await Promise.all([
        Prisma.preQualification.findMany({
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        }),
        Prisma.preQualification.count({}),
      ]);

      const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

      return {
        data: prequalification,
        pagination: {
          total,
          page: pageNumber,
          pageSize,
          totalPages,
          nextPage,
          prevPage,
          canGoNext: pageNumber < totalPages,
          canGoPrev: pageNumber > 1,
        },
      };
    });

    new CustomResponse(200, true, "success", res, result);
  } catch (error) {
    console.error("[getPreQualifications]", error);
    next(new InternalServerError("Server Error", 500));
  }
};



