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
  const userId = req?.user?.id!;

  const {
    bank_name,
    city,
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
    level_of_employment
  } = req.body;

  try {

    const response = await Prisma.preQualification.create({
      data: {
        bank_name,
        city,
        down_payment_goal: Number(down_payment_goal),
        email,
        fullname,
        home_address,
        monthly_budget: Number(monthly_budget),
        neighbourhood,
        occupation,
        phonenumber,
        state,
        employer_name,
        level_of_employment,
        userId,
      },
    });

        const userMailOptions = await createPrequalificationMailOptions({email, fullname, isAdmin: false });

    mailController({from: "noreply@arellow.com", ...userMailOptions})

    await deleteMatchingKeys("PreQualification:*");

    new CustomResponse(
      201,
      true,
      "Pre-Qualification successfully",
      res
    );
  } catch (error) {
    next(new InternalServerError("Pre-Qualification  request failed"));
  }
};



export const preQualificationDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = req?.user

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
      include: {
        user: {
          omit: {
            password: true,


          }
        }
      }
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
  const {status} = req.body;
 
  try {

   
    const response = await Prisma.preQualification.findUnique({where: { id }});


    if (!response) {
      return next(new InternalServerError("Pre qualification not found", 404));
    }


    await Prisma.preQualification.update({
      where: {id},
      data: {status}
    })




    new CustomResponse(200, true, "successfully", res, response);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }


};




export const getPreQualifications = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {
      page = "1",
      limit = "10"
    } = req.query;


    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);


    const cacheKey = `PreQualification:${JSON.stringify(req.query)}`;


    const result = await swrCache(cacheKey, async () => {
      const [prequalification, total] = await Promise.all([
        Prisma.preQualification.findMany({
          where: {},
          include: {
            user: {
              select: {
                email: true,
                fullname: true,
                username: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.preQualification.count({ where: {} })
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
          canGoPrev: pageNumber > 1
        }
      };
    });

    new CustomResponse(200, true, "success", res, result);


  } catch (error) {
    next(new InternalServerError("Server Error", 500));

  }

};



