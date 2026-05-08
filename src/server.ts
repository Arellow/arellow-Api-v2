import "dotenv/config";
import "express-async-errors";
import express from "express";
import http from "http";
import cors from "cors";
import { globalLimiter } from "./middlewares/rateLimit.middleware";
import logger from "./middlewares/logger.middleware";
import { PORT } from "./utils/constants.util";

import indexMiddleware from "./middlewares/index.middleware";
import errorHandler from "./middlewares/errors.middleware";
import { isLoginUser } from "./middlewares/auth.middleware";
import { initSocketIO } from "./features/userchat/route/socketServer";


const app = express();

const server = http.createServer(app);

// CORS — whitelist web origins; React Native sends no Origin so it passes through
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // No origin: React Native, Postman, server-to-server — allow
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: blocked origin ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
}));

app.use(globalLimiter);

// assign user to API routes
app.use(isLoginUser)

// Attach socket.io
initSocketIO(server);


// Middlewares
indexMiddleware(app);

// Public route
app.get("/", (req, res) => {
  res.send("welcome to arellow home");
});



// Custom error handling middleware
app.use(errorHandler);

// erver Start
(async () => {
  logger.info(`Attempting to run server on port ${PORT}`);

  server.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });
})();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  server.close();
  process.exit(0);
});

export default app;

