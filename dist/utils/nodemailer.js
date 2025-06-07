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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeMailerController = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: true },
});
transporter.verify((error, success) => {
    if (error) {
        console.error("Transporter verify error:", error);
    }
    else {
        console.log("Mailer ready:", success);
    }
});
const nodeMailerController = (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Email send error:", err);
                    reject(err);
                }
                else {
                    console.log("Email sent:", info.response);
                    resolve(info);
                }
            });
        });
        return info;
    }
    catch (error) {
        console.error("nodeMailerController error:", error);
        throw error;
    }
});
exports.nodeMailerController = nodeMailerController;
