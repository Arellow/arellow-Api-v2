
import express, { Application, json, urlencoded } from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import indexRoutes from "../features/appRoute";
import { paystackWebhook } from "../features/propertyverify/controller/webhook";

export default (app: Application) => {
  // Compress all JSON/text responses — skips already-compressed types (images, video)
  app.use(compression());

  // Concise log format in production; full in dev
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'combined'));



  // Configuration setup (dotenv)
  if (process.env.NODE_ENV !== 'production') configDotenv();

  app.use(
  "/paystack/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);
  // Security middleware
  app.use(helmet());

  
  // Body parsing middleware — 50kb cap stops large payload attacks on JSON routes
  app.use(json({ limit: "50kb" }));
  app.use(urlencoded({ extended: true, limit: "50kb" }));
  


  // Cookie parsing middleware
  app.use(cookieParser());

  
  // Mounting routes
  app.use("/api", indexRoutes);

};