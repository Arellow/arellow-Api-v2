import { Worker } from "bullmq";
import dotenv from 'dotenv'
import { assignPropertyRequestMailOption } from "../../../utils/mailer";
import sgMail from "@sendgrid/mail";
dotenv.config();

 
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const worker = new Worker("email", async (job) => {
  const { email, realtorName, location, propertyType, bedrooms , budget, furnishingStatus, from} = job.data;

  const mailOptions = await assignPropertyRequestMailOption({
             email,
             realtorName,
             location,
             propertyType,
             bedrooms,
             budget,
             furnishingStatus,
           });


    const respond = sgMail.send({ from, ...mailOptions });

    return respond;

}, { connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '11071', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
  }


 });

// worker.on("completed", (job) => {
//   console.log(`Email sent to ${job.data.propertyType}`);
// });

// worker.on("failed", (job, err) => {
//   console.error(`Failed to send email to ${job?.data?.email}`, err);
// });
