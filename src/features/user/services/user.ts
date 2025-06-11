import { BadRequestError, InternalServerError, NotFoundError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import { suspendedAccountMailOption } from "../../../utils/mailer";
import { nodeMailerController } from "../../../utils/nodemailer";
import { UserUpdateDto, UserResponseDto, UserUpdateRoleDto, UserSettingsDto, UserSuspendDto } from "../dtos/user.dto";


export class UserService {
  

  async getUserById(userId: string): Promise<UserResponseDto> {
    try {
      const user = await Prisma.user.findUnique({
        where: { id: userId },
        include: {
          projects: true, 
          rewardHistory: {
            where: { reason: { contains: "sold", mode: "insensitive" } }, 
          },
        },
      });
      if (!user) {
        throw new NotFoundError("User not found.");
      }

      // Calculate properties listed
      const propertiesListed = user.projects.length;

      // Calculate properties sold (assuming each sold entry in rewardHistory corresponds to a property sold)
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
    // if (data.avatar !== undefined) updatedData.avatar = data.avatar;

    const user = await Prisma.user.update({
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
      await Prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error("[deleteUser] Prisma error:", error);
      throw new InternalServerError("Database error when deleting user.");
    }
  }

    async suspendUser(userId: string, data: UserSuspendDto ): Promise<UserResponseDto> {
    try {
      const user = await Prisma.user.update({
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
  async updateUserRole(userId: string, data: UserUpdateRoleDto): Promise<UserResponseDto> {
    try {
      const validRoles = ["admin", "superadmin", "buyer", "agent", "realtor"];
      if (!validRoles.includes(data.role)) {
        throw new InternalServerError("Invalid role. Must be one of: admin, superAdmin, buyer, agent, realtor.");
      }

      const user = await Prisma.user.update({
        where: { id: userId },
        data: {
          role: data.role,
        },
      });
      return this.mapToResponse(user);
    } catch (error) {
      console.error("[updateUserRole] Prisma error:", error);
      throw new InternalServerError("Database error when updating user role.");
    }
  }

 private mapToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullname: user.fullname,
      avatar: user.avatar,
      banner: user.banner,
      phone_number: user.phone_number,
      gender: user.gender,
      city: user.city,
      country: user.country,
      biography: user.biography,
      rating: user.rating,
      is_verified: user.is_verified,
      role: user.role,
      createdAt: user.createdAt,
      kyc_status: user.kyc_status,
      nin_status: user.nin_status,
      nin_number: user.nin_number,
      nin_slip_url: user.nin_slip_url,
      cac_status: user.cac_status,
      cac_number: user.cac_number,
      cac_doc_url: user.cac_doc_url,
      badge: user.badge,
      face_status: user.face_status,
      face_image_url: user.face_image_url,
      kyc_verified_at: user.kyc_verified_at,
      points: user.points,
      last_login: user.last_login,
      suspended: user.suspended,
      twoFactorEnabled: user.twoFactorEnabled || false,
      propertiesListed: user.propertiesListed || 0,
      propertiesSold: user.propertiesSold || 0,
      selling: user.selling || 0,
    };
  }

}