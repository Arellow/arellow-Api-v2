"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const calculate_1 = require("../controllers/calculate");
const mortagageRoutes = express_1.default.Router();
mortagageRoutes.post("/calculate", auth_middleware_1.default, calculate_1.calculateCustomMortgage);
exports.default = mortagageRoutes;
