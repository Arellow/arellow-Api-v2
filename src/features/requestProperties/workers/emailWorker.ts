import { Worker } from "bullmq";
import dotenv from 'dotenv'
import { assignPropertyRequestMailOption } from "../../../utils/mailer";
import { mailController } from "../../../utils/nodemailer";
dotenv.config();


export const worker = new Worker("email", async (job) => {
  const { email, realtorName, location, propertyType, bedrooms , budget, furnishingStatus, from} = job.data;

  try {

  const mailOptions = await assignPropertyRequestMailOption({
             email,
             realtorName,
             location,
             propertyType,
             bedrooms,
             budget,
             furnishingStatus,
           });


    const respond = mailController({ from, ...mailOptions });

     await job.remove();

    return respond;

    } catch (error) {
      throw error;
      
    }



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
