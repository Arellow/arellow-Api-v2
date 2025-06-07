import 'dotenv/config';
import express from "express";
import indexMiddleware from "./middlewares/index.middleware";

const app = express();
indexMiddleware(app);

export default app;