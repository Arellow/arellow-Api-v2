"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const generateToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, jwtSecret, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
const generateRefreshToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, jwtSecret, { expiresIn: "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, jwtSecret);
};
exports.verifyToken = verifyToken;
