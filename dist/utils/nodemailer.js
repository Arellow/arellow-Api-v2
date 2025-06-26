"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailController = exports.nodeMailerController = void 0;
require("dotenv/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
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
const nodeMailerController = async (mailOptions) => {
    try {
        const info = await new Promise((resolve, reject) => {
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
};
exports.nodeMailerController = nodeMailerController;
const mailController = (mailOptions) => {
    // sgMail.setDataResidency('eu'); 
    try {
        mail_1.default.send(mailOptions);
        console.log('Email sent');
    }
    catch (error) {
        console.error(error);
    }
};
exports.mailController = mailController;
// const msg = {
//   to: 'rahkeem.shlome@fsitip.com', // Change to your recipient
//   from: 'info@arellow.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }
//  mailController(msg)
