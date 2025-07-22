import { Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { generateRefreshToken, generateToken } from "../../../utils/jwt";
import { UserResponseDTO } from "../dtos/registerUserDto";

export const userResponse = async({ res, user, message }: { res: Response, user: UserResponseDTO, message: string }) => {

    const token = generateToken(user.id, user.email);


    // const refreshToken = generateRefreshToken(user.id, user.email);

    // if(!res.headersSent){

    // res.removeHeader("Authorization");
    // res.removeHeader("x-refresh-token");

    // }


    // res.setHeader("Authorization", `Bearer ${token}`);
    // res.setHeader("x-refresh-token", refreshToken);


    const response = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        fullname: user.fullname,
        is_verified: user.is_verified,
        createdAt: user.createdAt,
        avatar: user.avatar,
        role: user.role,
        kyc: user.kyc,
        suspended: user.suspended

    };

    new CustomResponse(200, true, "Login successful", res, {
        user: response,
        token,
        message
    });

}