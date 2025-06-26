"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeService = void 0;
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
class SubscribeService {
    async subscribe(email, phone) {
        if (!email && !phone) {
            throw new appError_1.BadRequestError("Email or Phone number must be provided");
        }
        const emailLowerCase = email ? email.toLowerCase() : null;
        if (emailLowerCase) {
            const existingEmail = await prisma_1.Prisma.subscribe.findFirst({
                where: { email: emailLowerCase },
            });
            if (existingEmail) {
                throw new appError_1.DuplicateError("Email already subscribed");
            }
            const subscriber = await prisma_1.Prisma.subscribe.create({
                data: { email: emailLowerCase },
            });
            // Send welcome email
            const mailOption = await (0, mailer_1.subscribeMailOption)(emailLowerCase);
            await (0, nodemailer_1.nodeMailerController)(mailOption);
            return {
                message: "Successfully subscribed to newsletter",
                subscriber: {
                    id: subscriber.id,
                    email: subscriber.email
                }
            };
        }
        if (phone) {
            const existingPhone = await prisma_1.Prisma.subscribe.findFirst({
                where: { phone },
            });
            if (existingPhone) {
                throw new appError_1.DuplicateError("Phone number already subscribed");
            }
            const subscriber = await prisma_1.Prisma.subscribe.create({
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
exports.SubscribeService = SubscribeService;
