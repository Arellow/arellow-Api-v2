"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.suspendUser = exports.deleteUser = exports.updateUser = exports.getUserById = void 0;
const user_1 = require("../services/user");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
const userService = new user_1.UserService();
const getUserById = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await userService.getUserById(userId);
        new response_util_1.default(200, true, "User retrieved successfully", res, user);
    }
    catch (error) {
        console.error("[getUserById] error:", error);
        next(error);
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res, next) => {
    const userId = req.params.userId;
    const data = req.body;
    const allowedFields = ["fullname", "username", "phone_number"];
    const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        throw new appError_1.BadRequestError(`Cannot update fields: ${invalidFields.join(", ")}`);
    }
    try {
        const user = await userService.updateUser(userId, data);
        new response_util_1.default(200, true, "User updated successfully", res, user);
    }
    catch (error) {
        console.error("[updateUser] error:", error);
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        await userService.deleteUser(userId);
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        console.error("[deleteUser] error:", error);
        next(error);
    }
};
exports.deleteUser = deleteUser;
const suspendUser = async (req, res, next) => {
    const userId = req.params.userId;
    const data = req.body;
    console.log(data);
    try {
        const user = await userService.suspendUser(userId, data);
        new response_util_1.default(200, true, "User suspended successfully", res, user);
    }
    catch (error) {
        console.error("[suspendUser] error:", error);
        next(error);
    }
};
exports.suspendUser = suspendUser;
const updateUserRole = async (req, res, next) => {
    const userId = req.params.userId;
    const data = req.body;
    try {
        const user = await userService.updateUserRole(userId, data);
        new response_util_1.default(200, true, "User role updated successfully", res, user);
    }
    catch (error) {
        console.error("[updateUserRole] error:", error);
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
