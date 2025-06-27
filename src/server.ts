// import app from "./app";
import logger from "./middlewares/logger.middleware";
import { PORT } from "./utils/constants.util";





// export default app;


import 'dotenv/config';
// import './types/express';
import express from "express";
import indexMiddleware from "./middlewares/index.middleware";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";
import errorHandler from './middlewares/errors.middleware';


const app = express();
indexMiddleware(app);

app.use("/arellow-swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", (req, res,) => {
    res.send("welcome to arellow home");
});

// Custom error handling middleware - moved after routes
app.use(errorHandler);

(async () => {
  logger.info(`Attempting to run server on port ${PORT}`);
 
  app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });
  
})();

export default app;





