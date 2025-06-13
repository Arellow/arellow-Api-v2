import 'dotenv/config';
import express from "express";
import indexMiddleware from "./middlewares/index.middleware";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";

const app = express();
indexMiddleware(app);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;