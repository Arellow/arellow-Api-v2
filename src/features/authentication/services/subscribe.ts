import { Prisma } from "../../../lib/prisma";
import { BadRequestError, DuplicateError } from "../../../lib/appError";
import { subscribeMailOption } from "../../../utils/mailer";
import { mailController } from "../../../utils/nodemailer";

export class SubscribeService {
  async subscribe(email?: string | null, phone?: string | null) {
    if (!email && !phone) {
      throw new BadRequestError("Email or Phone number must be provided");
    }

    const emailLowerCase = email ? email.toLowerCase() : null;

    if (emailLowerCase) {
      const existingEmail = await Prisma.subscribe.findFirst({
        where: { email: emailLowerCase },
      });

      if (existingEmail) {
        throw new DuplicateError("Email already subscribed");
      }

      const subscriber = await Prisma.subscribe.create({
        data: { email: emailLowerCase },
      });

      // Send welcome email
      const mailOption = await subscribeMailOption(emailLowerCase);
       mailController({from: "info@arellow.com", ...mailOption});

      return {
        message: "Successfully subscribed to newsletter",
        subscriber: {
          id: subscriber.id,
          email: subscriber.email
          
        }
      };
    }

    if (phone) {
      const existingPhone = await Prisma.subscribe.findFirst({
        where: { phone },
      });

      if (existingPhone) {
        throw new DuplicateError("Phone number already subscribed");
      }

      const subscriber = await Prisma.subscribe.create({
        data: { phone },
      });

      return {
        message: "Successfully subscribed to newsletter",
        subscriber: {
          id: subscriber.id,
          phone: subscriber.phone,
        
        }
      };
    }
  }
}
