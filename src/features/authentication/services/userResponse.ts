import { Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import {  generateToken } from "../../../utils/jwt";
import { UserResponseDTO } from "../dtos/registerUserDto";

export const userResponse = async({ res, user, message }: { res: Response, user: UserResponseDTO, message: string }) => {

    const token = generateToken(user.id, user.email);

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
        suspended: user.suspended,
        address: user.address,
        AdminPermission: user?.AdminPermission?.action  || []

    };

    new CustomResponse(200, true, message, res, {
        user: response,
        token
    });

}