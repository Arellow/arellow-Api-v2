"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const propertyParsingAndValidation_1 = require("../../../middlewares/propertyParsingAndValidation");
const user_validation_1 = require("../../../validations/user.validation");
const usersRoutes = (0, express_1.Router)();
usersRoutes.get("/:userId", user_1.getUserById);
usersRoutes.patch("/:userId", auth_middleware_1.default, (0, propertyParsingAndValidation_1.validateSchema)(user_validation_1.updateUserSchema), user_1.updateUser);
usersRoutes.put("/:userId/role", auth_middleware_1.default, user_1.updateUserRole);
usersRoutes.put("/:userId/suspend", user_1.suspendUser);
usersRoutes.delete("/:userId", user_1.deleteUser);
exports.default = usersRoutes;
