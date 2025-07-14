import { PrismaClient, UserRole } from "@prisma/client";
import { BadRequestError, InternalServerError, NotFoundError } from "../../../lib/appError";
import { Prisma,  } from "../../../lib/prisma";
import { suspendedAccountMailOption } from "../../../utils/mailer";
import { nodeMailerController } from "../../../utils/nodemailer";
import { UserUpdateDto, UserResponseDto, UserSuspendDto } from "../dtos/user.dto";

const prisma = new PrismaClient();

export class UserService {
  async getUserById(userId: string): Promise<UserResponseDto> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          properties: true,
          rewardHistory: {
            where: { reason: { contains: "sold", mode: "insensitive" } },
          },
        },
      });
      if (!user) {
        throw new NotFoundError("User not found.");
      }

      // Calculate properties listed
      const propertiesListed = user.properties.length;

      // Calculate properties sold (based on rewardHistory length for sold transactions)
      const propertiesSold = user.rewardHistory.length;

      // Calculate selling (sum of points from sold transactions)
      const selling = user.rewardHistory.reduce((sum, entry) => sum + (entry.points || 0), 0);

      return this.mapToResponse({ ...user, propertiesListed, propertiesSold, selling });
    } catch (error) {
      console.error("[getUserById] Prisma error:", error);
      throw new InternalServerError("Database error when fetching user.");
    }
  }

  async updateUser(userId: string, data: UserUpdateDto): Promise<UserResponseDto> {
    try {
      const updatedData: any = {};

      if (data.fullname !== undefined) updatedData.fullname = data.fullname;
      if (data.username !== undefined) updatedData.username = data.username;
      if (data.phone_number !== undefined) updatedData.phone_number = data.phone_number;
      if (data.avatar !== undefined) updatedData.avatar = data.avatar;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
      });

      return this.mapToResponse(user);
    } catch (error) {
      console.error("[updateUser] Prisma error:", error);
      throw new InternalServerError("Database error when updating user.");
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error("[deleteUser] Prisma error:", error);
      throw new InternalServerError("Database error when deleting user.");
    }
  }

  async suspendUser(userId: string, data: UserSuspendDto): Promise<UserResponseDto> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          suspended: true,
        },
      });
      if (!user) {
        throw new NotFoundError("User not found.");
      }
      const mailOptions = await suspendedAccountMailOption(user.email, data?.reason);
      await nodeMailerController(mailOptions);

      return this.mapToResponse(user);
    } catch (error) {
      console.error("[suspendUser] Prisma error:", error);
      throw new InternalServerError("Database error when suspending user.");
    }
  }


  private mapToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullname: user.fullname,
      avatar: user.avatar,
      phone_number: user.phone_number,
      role: user.role as UserRole,
      is_verified: user.is_verified,
      suspended: user.suspended,
      points: user.points || 0,
      createdAt: user.createdAt,
      propertiesListed: user.propertiesListed || 0,
      propertiesSold: user.propertiesSold || 0,
      selling: user.selling || 0,
    };
  }
}