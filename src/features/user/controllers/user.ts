import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user";
import { UserSuspendDto, UserUpdateDto } from "../dtos/user.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError, InternalServerError } from "../../../lib/appError";
import { processImage } from "../../../utils/imagesprocess";
import { Prisma } from "../../../lib/prisma";
const userService = new UserService();



export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id!;

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
  const userId = req.user?.id!;
  const data = req.body as UserUpdateDto;

  const allowedFields = ["fullname", "username", "phone_number", "description"];
  const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
  if (invalidFields.length > 0) {
    throw new BadRequestError(`Cannot update fields: ${invalidFields.join(", ")}`);
  }


  try {
    const user = await userService.updateUser(userId, data);
    new CustomResponse(200, true, "User updated successfully", res, user);
  } catch (error) {
    // console.error("[updateUser] error:", error);
    next(error);
  }
};

export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id!;

  try {
    let avatar;

    if (req.file) {

      avatar = await processImage({
        folder: "kyc_container",
        image: req.file,
        photoType: "KYC",
        type: "PHOTO"
      });

    }

    if (!avatar) {
      throw new BadRequestError('user profile update failed');
    }

    const user = await userService.updateUserAvatar(userId, avatar);
    new CustomResponse(200, true, "avatar updated successfully", res, user);
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

  try {
    const user = await userService.suspendUser(userId, data);
    new CustomResponse(200, true, "User suspended successfully", res, user);
  } catch (error) {
    // console.error("[suspendUser] error:", error);
    next(error);
  }
};


export const updateNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id!;
  const {
    emailNotification,
    pushNotification,
    smsNotification
  } = req.body;

  try {

    const data = await Prisma.user.update({
      where: { id: userId },
      data: {
        setting: {
          emailNotification,
          pushNotification,
          smsNotification
        }
      }
    })

    new CustomResponse(200, true, "successful", res, data.setting);
  } catch (error) {
    console.error("[suspendUser] error:", error);
    next(error);
  }
};


export const requestReward = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id!;
  const {
    requestPoints,
    bankAccountName,
    bankAccountNumber,
    bankName,
  } = req.body;

  try {

    const isPendingWithdrawalRequest =   await Prisma.rewardRequest.findFirst({
      where: {userId, status: "PENDING"}
    });

     if (isPendingWithdrawalRequest) {
      throw new BadRequestError("Sorry your withdrawal request is still in process.");
    }



    const rewards = await Prisma.rewardHistory.findMany({
      where: { userId },
    });


    const totalEarning = rewards.reduce((v, c) => {

      if (c.type == "CREDIT") {
        v.CREDIT += c.points;
      }

      if (c.type == "DEBIT") {
        v.DEBIT += c.points;
      }

      return v;
    }, { CREDIT: 0, DEBIT: 0 });

    let withdrawableEarning = 0;
    const difference = totalEarning.CREDIT - totalEarning.DEBIT;

    if (totalEarning.DEBIT > totalEarning.CREDIT) {
      throw new BadRequestError("Sorry you don't have a withdrawable point");
    } else if (difference >= 200) {
      withdrawableEarning = difference - 200;
    } else {
      // withdrawableEarning = 0;

      throw new BadRequestError("Sorry you don't have a withdrawable point");
    }


    if (requestPoints > withdrawableEarning) {
      throw new BadRequestError("Sorry your request point is greater than your withdrawable point");
    }



    await Prisma.rewardRequest.create({
      data: {
        userId,
        requestPoints,
        bankAccountName,
        bankAccountNumber,
        bankName,
        status: "PENDING"
      }
    })

    new CustomResponse(200, true, "Request successful", res,isPendingWithdrawalRequest);
  } catch (error) {
    console.error("[suspendUser] error:", error);
    next(error);
  }
};




export const allUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Prisma.user.findMany({
      where: {
        role: {
          notIn: ['ADMIN', 'SUPER_ADMIN'], 
        },
        is_verified: true,
        suspended: false,
      },
      select: {avatar: true, id: true, fullname: true, username: true, role: true}
    });

    new CustomResponse(200, true, "Users fetched successfully", res, result);
  } catch (error) {
    next(new InternalServerError("Failed to fetch users"));
  }
};

export const allAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Prisma.user.findMany({
      where: {
        role: {
          notIn: ['DEVELOPER', 'BUYER', "REALTOR", "SUPER_ADMIN"], 
        },
      },
      select: {avatar: true, id: true, fullname: true, username: true, role: true}
    });

    new CustomResponse(200, true, "Admins fetched successfully", res, result);
  } catch (error) {
    next(new InternalServerError("Failed to fetch admins"));
  }
};

