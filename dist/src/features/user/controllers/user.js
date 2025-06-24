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
exports.updateUserRole = exports.suspendUser = exports.deleteUser = exports.updateUser = exports.getUserById = void 0;
const user_1 = require("../services/user");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
const userService = new user_1.UserService();
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const user = yield userService.getUserById(userId);
        new response_util_1.default(200, true, "User retrieved successfully", res, user);
    }
    catch (error) {
        console.error("[getUserById] error:", error);
        next(error);
    }
});
exports.getUserById = getUserById;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const data = req.body;
    const allowedFields = ["fullname", "username", "phone_number"];
    const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        throw new appError_1.BadRequestError(`Cannot update fields: ${invalidFields.join(", ")}`);
    }
    try {
        const user = yield userService.updateUser(userId, data);
        new response_util_1.default(200, true, "User updated successfully", res, user);
    }
    catch (error) {
        console.error("[updateUser] error:", error);
        next(error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        yield userService.deleteUser(userId);
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        console.error("[deleteUser] error:", error);
        next(error);
    }
});
exports.deleteUser = deleteUser;
const suspendUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const data = req.body;
    console.log(data);
    try {
        const user = yield userService.suspendUser(userId, data);
        new response_util_1.default(200, true, "User suspended successfully", res, user);
    }
    catch (error) {
        console.error("[suspendUser] error:", error);
        next(error);
    }
});
exports.suspendUser = suspendUser;
const updateUserRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const data = req.body;
    try {
        const user = yield userService.updateUserRole(userId, data);
        new response_util_1.default(200, true, "User role updated successfully", res, user);
    }
    catch (error) {
        console.error("[updateUserRole] error:", error);
        next(error);
    }
});
exports.updateUserRole = updateUserRole;
