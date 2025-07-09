import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user";
import { UserSuspendDto, UserUpdateDto, UserUpdateRoleDto } from "../dtos/user.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError } from "../../../lib/appError";
const userService = new UserService();



export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId as string;

  try {
    const user = await userService.getUserById(userId);
    new CustomResponse(200, true, "User retrieved successfully", res, user);
  } catch (error) {
    console.error("[getUserById] error:", error);
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId as string;
  const data = req.body as UserUpdateDto;

 
  const allowedFields = ["fullname", "username", "phone_number"];
  const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
  if (invalidFields.length > 0) {
    throw new BadRequestError(`Cannot update fields: ${invalidFields.join(", ")}`);
  }

  try {
    const user = await userService.updateUser(userId, data);
    new CustomResponse(200, true, "User updated successfully", res, user);
  } catch (error) {
    console.error("[updateUser] error:", error);
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId as string;

  try {
    await userService.deleteUser(userId);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("[deleteUser] error:", error);
    next(error);
  }
};

export const suspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId as string;
  const data = req.body as UserSuspendDto;
   console.log(data)
  try {
    const user = await userService.suspendUser(userId, data);
   new CustomResponse(200, true, "User suspended successfully", res, user);
  } catch (error) {
    console.error("[suspendUser] error:", error);
    next(error);
  }
};
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId as string;
  const data = req.body as UserUpdateRoleDto;

  try {
    const user = await userService.updateUserRole(userId, data)
    new CustomResponse(200, true, "User role updated successfully", res, user);
  } catch (error) {
    console.error("[updateUserRole] error:", error);
    next(error);
  }
};
