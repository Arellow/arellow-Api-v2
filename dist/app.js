"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const index_middleware_1 = __importDefault(require("./middlewares/index.middleware"));
const app = (0, express_1.default)();
(0, index_middleware_1.default)(app);
exports.default = app;
