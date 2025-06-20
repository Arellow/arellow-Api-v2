import app from "./app";
import logger from "./middlewares/logger.middleware";

const PORT = process.env.PORT || 9871;

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
//       "src": "dist/server.js",
//       "use": "@vercel/node"
//     }
//   ],
//   "routes": [
//     {
//       "src": "/(.*)",
//       "dest": "dist/server.js"
//     }
//   ]
// } 


// "scripts": {
//     "postinstall": "prisma generate",
//     "start": "node --max-old-space-size=512 dist/server.js",
//     "dev": "nodemon --exec ts-node src/server.ts",
//     "build": "tsc",
//     "prisma:generate": "prisma generate"
//   },


  // "dev": "nodemon --exec ts-node src/server.ts",