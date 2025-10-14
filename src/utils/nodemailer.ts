import 'dotenv/config'
import sgMail, {MailDataRequired} from "@sendgrid/mail";

 
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//      user: process.env.AUTH_EMAIL,
//     pass: process.env.AUTH_EMAIL_PASSWORD,
//   },
//   tls: { rejectUnauthorized: true },
// });


// transporter.verify((error: Error | null, success: boolean) => {
//   if (error) {
//     console.error("Transporter verify error:", error);
//   } else {
//     console.log("Mailer ready:", success);
//   }
// });



export const mailController =  async(mailOptions: MailDataRequired) => {

  try {

    sgMail.send(mailOptions);

  } catch (error:any) {
    
    //  console.error(error?.response?.body)
  }

};





// const msg = {
//   to: 'rahkeem.shlome@fsitip.com', // Change to your recipient
//   from: 'info@arellow.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }


//  mailController(msg)
  