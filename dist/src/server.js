"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_middleware_1 = __importDefault(require("./middlewares/logger.middleware"));
const constants_util_1 = require("./utils/constants.util");
(() => __awaiter(void 0, void 0, void 0, function* () {
    logger_middleware_1.default.info(`Attempting to run server on port ${constants_util_1.PORT}`);
    app_1.default.listen(constants_util_1.PORT, () => {
        logger_middleware_1.default.info(`Listening on port ${constants_util_1.PORT}`);
    });
}))();
exports.default = app_1.default;
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
