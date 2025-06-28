import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/loginUser";
import { LoginDto } from "../dtos/loginUserDto";
import { BadRequestError } from "../../../lib/appError";
import { trimObjectKeys } from "../../../utils/trim";
import CustomResponse from "../../../utils/helpers/response.util";
import { generateRefreshToken, generateToken } from "../../../utils/jwt";

export class LoginController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      trimObjectKeys(req.body);
    } catch (err) {
      console.error("Trim keys failed:", err);
      throw new BadRequestError("Failed to sanitize input keys");
    }

    try {
      const { email, password } = req.body;

      if (typeof email !== "string" || typeof password !== "string") {
        throw new BadRequestError(
          "Invalid input. Email and password must be strings."
        );
      }

      const loginDto: LoginDto = { email, password };
      const { user } = await AuthService.login(loginDto);

      const token = generateToken(user.id, user.email);


      const refreshToken = generateRefreshToken(user.id, user.email);

      res.setHeader("Authorization", `Bearer ${token}`);
      res.setHeader("x-refresh-token", refreshToken);

      new CustomResponse(200, true, "Login successful", res, {
        user,
        token,
        message:
          "Use this token in the Authorization header as: Bearer <token>",
      });
    } catch (error) {
      next(error);
    }
  }
}
