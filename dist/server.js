"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_middleware_1 = __importDefault(require("./middlewares/logger.middleware"));
const constants_util_1 = require("./utils/constants.util");
(async () => {
    logger_middleware_1.default.info(`Attempting to run server on port ${constants_util_1.PORT}`);
    app_1.default.listen(constants_util_1.PORT, () => {
        logger_middleware_1.default.info(`Listening on port ${constants_util_1.PORT}`);
    });
})();
exports.default = app_1.default;
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
