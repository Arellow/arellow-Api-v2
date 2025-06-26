"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const auth_middleware_1 = __importStar(require("../../../middlewares/auth.middleware"));
const propertyParsingAndValidation_1 = require("../../../middlewares/propertyParsingAndValidation");
const user_validation_1 = require("../../../validations/user.validation");
const leaderboard_1 = require("../controllers/leaderboard");
const usersRoutes = (0, express_1.Router)();
usersRoutes.get("/leaderboard/:userId", auth_middleware_1.default, leaderboard_1.getRealtorsLeaderboard);
usersRoutes.get("/:userId", user_1.getUserById);
usersRoutes.patch("/:userId", auth_middleware_1.default, (0, propertyParsingAndValidation_1.validateSchema)(user_validation_1.updateUserSchema), user_1.updateUser);
usersRoutes.put("/:userId/role", auth_middleware_1.default, auth_middleware_1.isAdmin, user_1.updateUserRole);
usersRoutes.put("/:userId/suspend", user_1.suspendUser);
usersRoutes.delete("/:userId", user_1.deleteUser);
exports.default = usersRoutes;
