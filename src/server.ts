import app from "./app";
import logger from "./middlewares/logger.middleware";

export const PORT = process.env.PORT || 9871;

(async () => {
  logger.info(`Attempting to run server on port ${PORT}`);
 
  app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });
})();