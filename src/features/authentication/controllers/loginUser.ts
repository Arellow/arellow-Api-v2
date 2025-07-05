import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/loginUser";
import { LoginDto } from "../dtos/loginUserDto";
import { userResponse } from "../services/userResponse";

function loginInput(input: LoginDto) {
  return {
    password: input.password?.trim(),
    email: input.email?.trim().toLowerCase()
  };
}

export class LoginController {
  static async login(req: Request, res: Response, next: NextFunction) {
   
    try {
     
      const userInput = loginInput(req.body);

      const user  = await AuthService.login(userInput);

      userResponse({user, res, message: "User login successfully"});

    } catch (error) {
      next(error);
    }
  }
}
