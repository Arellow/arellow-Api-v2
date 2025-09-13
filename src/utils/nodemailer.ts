import 'dotenv/config'
import nodemailer, { SendMailOptions, SentMessageInfo } from "nodemailer";
import sgMail, {MailDataRequired} from "@sendgrid/mail";
import { NextFunction, Request, Response } from 'express';
 
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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

// export const nodeMailerController = async (mailOptions: SendMailOptions): Promise<SentMessageInfo> => {
//   try {
//     const info = await new Promise<SentMessageInfo>((resolve, reject) => {
//       transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//           console.error("Email send error:", err);
//           reject(err);
//         } else {
//           console.log("Email sent:", info.response);
//           resolve(info);
//         }
//       });
//     });
//     return info;
//   } catch (error) {
//     console.error("nodeMailerController error:", error);
//     throw error;
//   }
// };



export const mailController =  async(mailOptions: MailDataRequired) => {

  try {
    //  sgMail.send(mailOptions);

    const emailOptions = {
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
    from: process.env.MAIL_FROM
} as SendMailOptions;

    // transporter.sendMail(emailOptions);

await fetch('https://your-vercel-project.vercel.app/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-secret',
  },
  body: JSON.stringify(emailOptions),
});



  } catch (error:any) {
    
    //  console.error(error?.response?.body)
  }

};


export const sendMail = (req: Request, res: Response, next: NextFunction) => {
     
      transporter.sendMail({...req.body});

    res.status(200).json({ message: 'Email sent!' });

 }


// const msg = {
//   to: 'rahkeem.shlome@fsitip.com', // Change to your recipient
//   from: 'info@arellow.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }


//  mailController(msg)
  