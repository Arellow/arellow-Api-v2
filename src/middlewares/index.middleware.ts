
import express, { Application, json, urlencoded } from "express";
import { configDotenv } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import indexRoutes from "../features/appRoute";
import { paystackWebhook } from "../features/propertyverify/controller/webhook";

export default (app: Application) => {
  // Logging middleware
  app.use(morgan("combined"));

  // CORS middleware 
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Configuration setup (dotenv)
  if (process.env.NODE_ENV !== 'production') configDotenv();

  app.use(
  "/paystack/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhook
);

  // Body parsing middleware
  app.use(json());
  app.use(urlencoded({ extended: true }));
  
  // Security middleware
  app.use(helmet());

  // Cookie parsing middleware
  app.use(cookieParser());

  
  // Mounting routes
  app.use("/api", indexRoutes);

};