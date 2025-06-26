import app from "./app";
import logger from "./middlewares/logger.middleware";
import { PORT } from "./utils/constants.util";



(async () => {
  logger.info(`Attempting to run server on port ${PORT}`);
 
  app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });
  
})();

export default app;



// {
//   "version": 2,
//   "builds": [
//     {
//       "src": "api/server.ts",
//       "use": "@vercel/node"
//     }
//   ],
//   "routes": [
//     { "src": "/(.*)", "dest": "api/server.ts" }
//   ]
// }

