import 'dotenv/config'

interface MailOptions {
  // to: { email: string; name?: string }[];
  // from: { email: string; name?: string };
    from: string
    to: string;
  subject: string;
  html?: string;

}




import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
});



export const mailController = async (mailOptions: MailOptions) => {
  try {
    const sentFrom = new Sender(
      mailOptions.from,
       "Arellow Homes"
    );


    const recipients = [
  new Recipient(mailOptions.to, "Esteem user")
];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(mailOptions.subject)
      .setHtml(mailOptions.html || "")
      // .setText(mailOptions.text || "");

    // const response = await mailerSend.email.send(emailParams);
     mailerSend.email.send(emailParams);

    // return response;

  } catch (error: any) {
    // console.error("MailerSend error:", error?.body || error);
    // throw error;
  }
};

