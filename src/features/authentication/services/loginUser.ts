
import { LoginDto } from "../dtos/loginUserDto";
import bcrypt from "bcryptjs";
import { Prisma } from "../../../lib/prisma";
import { BadRequestError, UnAuthorizedError } from "../../../lib/appError";

export class AuthService {
  static async login({ email, password }: LoginDto) {

    if (!email || !password) {
      throw new BadRequestError("Email and password are required.");
    }

    const user = await Prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        kyc: {
          select: {
            status: true
          }
        }, 
        AdminPermission: {
          select: {
            action: true
          }
        }
      },
      
    });

    if (!user) throw new UnAuthorizedError("Account does not exist.");
   
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnAuthorizedError("Invalid credentials.");
    }

    await Prisma.user.update({where: {email: email.toLowerCase()},
    data: {lastSeen: new Date()}
  });


    return user;

  }
}
