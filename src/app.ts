import 'dotenv/config';
import express from "express";
import indexMiddleware from "./middlewares/index.middleware";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";
import errorHandler from './middlewares/errors.middleware';

const app = express();
indexMiddleware(app);

// app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/", (req,res,) => {
    res.send("hello world")

});


  // Custom error handling middleware - moved after routes
  app.use(errorHandler);

export default app;