import { RegisterDTO,UserResponseDTO } from "../dtos/registerUserDto";
import { Prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
import { DuplicateError, UnAuthorizedError } from "../../../lib/appError";
import { emailVerificationMailOption } from "../../../utils/mailer";
import { mailController, 
  // nodeMailerController 
} from "../../../utils/nodemailer";
import { generateToken } from "../../../utils/jwt";

export class AuthService {
  public static async registerUser(dto: RegisterDTO): Promise<UserResponseDTO> {
    const { username, password, email, phone_number, fullname , role} = dto;


    if(role == "SUPER_ADMIN" || role == "ADMIN"){
      throw new UnAuthorizedError("Forbidden: unauthorise user role", 403);
    }


    const existingUser = await Prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new DuplicateError("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone_number,
        role,
        fullname,
      },
    });
    const verificationToken = generateToken(newUser.id, newUser.email);
    const verificationUrl = `${process.env.FRONTEND_URL_LOCAL}/verify-email?token=${verificationToken}`;
    const mailOptions = await emailVerificationMailOption(newUser.email, verificationUrl);
    // await nodeMailerController(mailOptions);
    mailController({from: "noreply@arellow.com", ...mailOptions})


    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone_number: newUser.phone_number,
      fullname: newUser.fullname,
      is_verified: newUser.is_verified,
      createdAt: newUser.createdAt,
      avatar:newUser.avatar,
      role:newUser.role
    };
  }
}


    // const msg = {
//   to: 'rahkeem.shlome@fsitip.com', // Change to your recipient
//   from: 'info@arellow.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }