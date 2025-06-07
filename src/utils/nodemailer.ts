import nodemailer, { Transporter, SendMailOptions, SentMessageInfo } from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
     user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_EMAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: true },
});


transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error("Transporter verify error:", error);
  } else {
    console.log("Mailer ready:", success);
  }
});

export const nodeMailerController = async (mailOptions: SendMailOptions): Promise<SentMessageInfo> => {
  try {
    const info = await new Promise<SentMessageInfo>((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email send error:", err);
          reject(err);
        } else {
          console.log("Email sent:", info.response);
          resolve(info);
        }
      });
    });
    return info;
  } catch (error) {
    console.error("nodeMailerController error:", error);
    throw error;
  }
};
