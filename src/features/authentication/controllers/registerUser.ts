
import { Request, Response, NextFunction } from "express";
import { RegisterDTO } from "../dtos/registerUserDto";
import { AuthService } from "../services/registerUser";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError, DuplicateError } from "../../../lib/appError";
import { trimObjectKeys } from "../../../utils/trim";


function registerInput(input: RegisterDTO) {
  return {
    username: input.username?.trim(),
    password: input.password?.trim(),
    email: input.email?.trim().toLowerCase(),
    phone_number: input.phone_number?.trim(),
    fullname: input.fullname?.trim(),
    role: input.role
  };
}

export class RegisterController {
  static async register(req: Request, res: Response, next: NextFunction) {
    // try {
    // } catch (err) {
    //   console.error("Trim keys failed:", err);
    //   throw new BadRequestError("Failed to sanitize input keys");
    // }
    
    
    try {
      
      trimObjectKeys(req.body);

       const userInput = registerInput(req.body);

       console.log({userInput})


      // const { username, password, email, phone_number, fullname, role } = req.body;

      // const missingFields = [];
      // if (!username) missingFields.push("username");
      // if (!password) missingFields.push("password");
      // if (!email) missingFields.push("email");
      // if (!phone_number) missingFields.push("phone_number");
      // if (!fullname) missingFields.push("fullname");

      // if (missingFields.length > 0) {
      //   throw new BadRequestError(
      //     `Missing required fields: ${missingFields.join(", ")}`
      //   );
      // }
      // if (
      //   typeof username !== "string" ||
      //   typeof password !== "string" ||
      //   typeof email !== "string" ||
      //   typeof phone_number !== "string" ||
      //   typeof fullname !== "string"
      // ) {
      //   throw new BadRequestError("All fields must be strings");
      // }

      // const dto: RegisterDTO = {
      //   username,
      //   password,
      //   email,
      //   phone_number,
      //   fullname,
      // };
      const user = await AuthService.registerUser(userInput);

      // new CustomResponse(
      //   201,
      //   true,
      //   "User registered successfully. Check your email to verify.",
      //   res,
      //   user
      // );

    } catch (error) {
      if (error instanceof DuplicateError) {
        next(new BadRequestError("Email or username already exists"));
      } else {
        next(error);
      }
    }
  }
}
