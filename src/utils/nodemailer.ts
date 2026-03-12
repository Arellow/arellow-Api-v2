import 'dotenv/config'
import { SendMailClient } from "zeptomail";

interface MailOptions {
    from: string
    to: string;
  subject: string;
  html?: string;

}


const url = "https://api.zeptomail.com/v1.1/email";
const token = process.env.ZOHO_MAIL_API_KEY!;

let client = new SendMailClient({url, token});



export const mailController = async (mailOptions: MailOptions) => {
  try {


client.sendMail({
    "from": 
    {
        "address": mailOptions.from,
        "name": "Arellow Homes"
    },
    "to": 
    [
        {
        "email_address": 
            {
                "address": mailOptions.to,
                "name": "Arellow Homes",
            }
        }
    ],
    "subject": mailOptions.subject,
    "htmlbody": mailOptions.html,
})


  } catch (error: any) {
   
  }
};

