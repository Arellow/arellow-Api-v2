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
//   "compilerOptions": {
//     "target": "ES2020",
//     "lib": ["ES2020"],
//     "module": "commonjs",
//     "moduleResolution": "node",
//     "outDir": "./dist",
//     "rootDir": "./src",
//     "strict": true,
//     "esModuleInterop": true,
//     "resolveJsonModule": true,
//     "skipLibCheck": true,
//     "forceConsistentCasingInFileNames": true,
//     "typeRoots": ["./node_modules/@types", "./src/types"],
//   },
//   "include": ["src/**/*.ts"],
//   "exclude": ["node_modules", "dist"]
// }


