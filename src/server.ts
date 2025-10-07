// import logger from "./middlewares/logger.middleware";
// import { PORT } from "./utils/constants.util";
// import 'dotenv/config';
// import express from "express";
// import indexMiddleware from "./middlewares/index.middleware";
// import errorHandler from './middlewares/errors.middleware';
// import { isLoginUser } from "./middlewares/auth.middleware";
// import { setupSocket } from "./socketServer";
// import http from "http";

// const app = express();

// const httpServer = http.createServer(app);
// const io = setupSocket(httpServer);
// app.use(isLoginUser)
// indexMiddleware(app)

// app.use("/", async(req, res) => {


//     res.send("welcome to arellow home");

// });

// // Custom error handling middleware - moved after routes
// app.use(errorHandler);

// (async () => {
//   logger.info(`Attempting to run server on port ${PORT}`);
 
//   httpServer.listen(PORT, () => {
//     logger.info(`Listening on port ${PORT}`);
//   });
  
// })();

// export default app;


import "dotenv/config";
import "express-async-errors";
import express from "express";
import http from "http";

import logger from "./middlewares/logger.middleware";
import { PORT } from "./utils/constants.util";

import indexMiddleware from "./middlewares/index.middleware";
import errorHandler from "./middlewares/errors.middleware";
import { isLoginUser } from "./middlewares/auth.middleware";
import { initSocketIO } from "./features/userchat/route/socketServer";


const app = express();

const server = http.createServer(app);

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

