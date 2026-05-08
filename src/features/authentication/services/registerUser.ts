import { RegisterDTO } from "../dtos/registerUserDto";
import { Prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { DuplicateError, UnAuthorizedError } from "../../../lib/appError";
import { emailVerificationMailOption } from "../../../utils/mailer";
import { mailController, } from "../../../utils/nodemailer";
import { generateToken } from "../../../utils/jwt";

const generateReferralCode = (username: string): string =>
  (username.slice(0, 4) + crypto.randomBytes(3).toString("hex")).toUpperCase();

export class AuthService {
  public static async registerUser(dto: RegisterDTO) {
    const { username, password, email, phone_number, fullname, role, referralCode } = dto;

    if(role == "SUPER_ADMIN" || role == "ADMIN"){
      throw new UnAuthorizedError("Forbidden: unauthorise user role", 403);
    }

    const [existingUser, existingUserName] = await Promise.all([
      Prisma.user.findUnique({ where: { email } }),
      Prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingUser) throw new DuplicateError("Email already exists.");
    if (existingUserName) throw new DuplicateError("User name already exists.");

    // Validate referral code if provided
    let referredByCode: string | undefined;
    if (referralCode) {
      const referrer = await Prisma.user.findUnique({ where: { referralCode: referralCode.toUpperCase() } });
      if (referrer) referredByCode = referralCode.toUpperCase();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanedPhoneNumber = phone_number.phone.replace(/[^\d+]/g, '');

    // Generate unique referral code for the new user
    let newUserReferralCode = generateReferralCode(username);
    const codeExists = await Prisma.user.findUnique({ where: { referralCode: newUserReferralCode } });
    if (codeExists) newUserReferralCode = generateReferralCode(username + Date.now());

    console.log({
      referralCode: newUserReferralCode,
        referredBy: referredByCode,
    })


    const newUser = await Prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone_number: cleanedPhoneNumber,
        role,
        fullname,
        referralCode: newUserReferralCode,
        referredBy: referredByCode,
        address: {
          country: phone_number.country,
          city: "",
          location: "",
          state: ""
        },
        setting: {
          emailNotification: true,
          pushNotification: true,
          smsNotification: false
        }
      },
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
      }
    });

    if(newUser.role === "BUYER"){
      await Prisma.notification.create({
        data: {message: notificationData.BUYER.message, title: notificationData.BUYER.title, userId: newUser.id, category: "GENERAL"}
      })
    }

    if(newUser.role === "DEVELOPER" || newUser.role === "REALTOR" ){
      await Prisma.notification.create({
        data: {message: notificationData.REALTOR_DEVELOPER.message, title: notificationData.REALTOR_DEVELOPER.title, userId: newUser.id}
      })
    }



    const verificationToken = generateToken(newUser.id, newUser.email);
    const verificationUrl = encodeURI(`https://arellow.com/authentication/verify-email/${verificationToken}`);
    const mailOptions = await emailVerificationMailOption(newUser.email, verificationUrl);
    
    mailController({from: "noreply@arellow.com", ...mailOptions})

    return newUser;

  }
}

const notificationData = {

  BUYER : {
    title: "✅ Welcome to Arellow!",
    message: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Arellow</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h1>✅ Welcome to Arellow!</h1>

  <div style="font-size: 1.2em;">
    <p>We’re thrilled to have you join the Arellow community 🎉</p>
    
    <p>At Arellow, we make it easier for you to find and buy your dream home across Nigeria. With our platform, you’ll enjoy:</p>

    <ul>
      <li>🔒 <strong>Verified realtors & developers</strong> – so you can trust every property you see.</li>
      <li>🏡 <strong>Featured properties</strong> – exclusive listings you won’t want to miss.</li>
      <li>🤝 <strong>Seamless connections</strong> – link directly with sellers, developers, and agents.</li>
      <li>💡 <strong>Smart tools & updates</strong> – property verification, AI-powered conversations, and more coming your way.</li>
    </ul>

    <p>Before you dive in, please check your email inbox and verify your account to unlock your full experience.</p>
    <p>👉 Didn’t get it? Check your spam or promotions folder.</p>

    <p>Welcome once again, and get ready to explore a smarter way of buying homes with Arellow 🚀</p>
  </div>
</body>
</html>

    `
  },
  REALTOR_DEVELOPER: {
      title: "✅ Welcome to Arellow!",
      message: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Arellow</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
  
  <!-- Header -->
  <h1>✅ Welcome to Arellow!</h1>

  <!-- Body -->
  <div style="font-size: 1.2em;">
    <p>We’re excited to have you partner with the Arellow family 🎉</p>

    <p>At Arellow, we believe selling homes should be seamless, credible, and rewarding. That’s why we’ve created a platform built to help realtors and developers grow:</p>

    <ul>
      <li>🔒 <strong>Verified profiles</strong> — build trust with buyers through our KYC and verification process.</li>
      <li>🏡 <strong>Showcase your properties</strong> — list homes that reach a wider, qualified audience.</li>
      <li>🤝 <strong>Direct buyer connections</strong> — engage directly with serious buyers looking for their next home.</li>
      <li>💡 <strong>Smart selling tools</strong> — property verification, AI-powered interactions, and upcoming features designed to boost your visibility and sales.</li>
    </ul>

    <p>Your journey to faster, smarter sales starts here — but first, let’s secure your account.</p>
    <p>👉 <strong>Check your email inbox and verify your account</strong> to unlock your full Arellow experience. <em>(Don’t forget to check your spam or promotions folder if it’s not there.)</em></p>

    <p>Welcome aboard! 🚀 Together, let’s make selling homes easier, faster, and more profitable with Arellow.</p>
  </div>

</body>
</html>

      `
  }

}
