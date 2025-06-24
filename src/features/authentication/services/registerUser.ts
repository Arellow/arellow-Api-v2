import { RegisterDTO,UserResponseDTO } from "../dtos/registerUserDto";
import { Prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DuplicateError } from "../../../lib/appError";
import { emailVerificationMailOption } from "../../../utils/mailer";
import { nodeMailerController } from "../../../utils/nodemailer";
import { generateToken } from "../../../utils/jwt";

export class AuthService {
  public static async registerUser(dto: RegisterDTO): Promise<UserResponseDTO> {
    const { username, password, email, phone_number, fullname } = dto;

    const emailLower = email.toLowerCase();
    const existingUser = await Prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new DuplicateError("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Prisma.user.create({
      data: {
        username,
        email: emailLower,
        password: hashedPassword,
        phone_number,
        role:"REALTOR",
        fullname,
        is_verified: false,
        avatar: "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?w=740"
      },
    });
    const verificationToken = generateToken(newUser.id, newUser.email);
    const verificationUrl = `${process.env.FRONTEND_URL_LOCAL}/verify-email?token=${verificationToken}`;
    const mailOptions = await emailVerificationMailOption(newUser.email, verificationUrl);
    await nodeMailerController(mailOptions);

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone_number: newUser.phone_number,
      fullname: newUser.fullname,
      is_verified: newUser.is_verified,
      createdAt: newUser.createdAt,
      avatar:newUser.avatar
    };
  }
}
