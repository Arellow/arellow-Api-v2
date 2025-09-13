
import { Request, Response, NextFunction } from "express";
import { RegisterDTO } from "../dtos/registerUserDto";
import { AuthService } from "../services/registerUser";
import { InternalServerError } from "../../../lib/appError";
import { userResponse } from "../services/userResponse";


function registerInput(input: RegisterDTO) {
  return {
    username: input.username?.trim(),
    password: input.password?.trim(),
    email: input.email?.trim().toLowerCase(),
    phone_number: {
      phone:input.phone_number.phone?.trim(),
      country: input.phone_number.country.trim()
    },
    fullname: input.fullname?.trim(),
    role: input.role,
  };
}

export class RegisterController {
  static async register(req: Request, res: Response, next: NextFunction) {
   
    
    try {

       const fullName = req.body?.fullname?.trim().split(' ');
      
              
        if (!fullName || fullName.length < 2) {
            return next(new InternalServerError('Update full name to continue e.g. John Doe ', 400));
        }


       const userInput = registerInput(req.body);

      const user = await AuthService.registerUser(userInput);

      userResponse({user, res, message: "Registration successfully."})

    } catch (error) {
      next(error);
      // if (error instanceof DuplicateError) {
      //   next(new BadRequestError("Email or username already exists"));
      // } else {
      //   next(error);
      // }
    }
  }
}
