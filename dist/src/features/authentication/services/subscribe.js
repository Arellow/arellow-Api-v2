"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeService = void 0;
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
class SubscribeService {
    subscribe(email, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email && !phone) {
                throw new appError_1.BadRequestError("Email or Phone number must be provided");
            }
            const emailLowerCase = email ? email.toLowerCase() : null;
            if (emailLowerCase) {
                const existingEmail = yield prisma_1.Prisma.subscribe.findFirst({
                    where: { email: emailLowerCase },
                });
                if (existingEmail) {
                    throw new appError_1.DuplicateError("Email already subscribed");
                }
                const subscriber = yield prisma_1.Prisma.subscribe.create({
                    data: { email: emailLowerCase },
                });
                // Send welcome email
                const mailOption = yield (0, mailer_1.subscribeMailOption)(emailLowerCase);
                yield (0, nodemailer_1.nodeMailerController)(mailOption);
                return {
                    message: "Successfully subscribed to newsletter",
                    subscriber: {
                        id: subscriber.id,
                        email: subscriber.email
                    }
                };
            }
            if (phone) {
                const existingPhone = yield prisma_1.Prisma.subscribe.findFirst({
                    where: { phone },
                });
                if (existingPhone) {
                    throw new appError_1.DuplicateError("Phone number already subscribed");
                }
                const subscriber = yield prisma_1.Prisma.subscribe.create({
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
        });
    }
}
exports.SubscribeService = SubscribeService;
