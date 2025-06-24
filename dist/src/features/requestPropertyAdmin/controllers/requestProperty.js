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
exports.deletePropertyRequest = exports.updatePropertyRequest = exports.getPropertyRequestById = exports.getAllPropertyRequests = void 0;
const requestProperty_1 = require("../services/requestProperty");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const propertyService = new requestProperty_1.PropertyService();
const getAllPropertyRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { page, limit } = req.query;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const result = yield propertyService.getAllPropertyRequests(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
        new response_util_1.default(200, true, "Property requests fetched successfully", res, result);
    }
    catch (error) {
        console.error("Get all property requests error:", error);
        next(new appError_1.InternalServerError("Failed to fetch property requests."));
    }
});
exports.getAllPropertyRequests = getAllPropertyRequests;
const getPropertyRequestById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    if (!id) {
        res.status(400).json({
            status: "failed",
            message: "Property request ID is required",
            succeeded: false,
        });
        return;
    }
    try {
        const result = yield propertyService.getPropertyRequestById(id, userId);
        if (!result) {
            res.status(404).json({
                status: "failed",
                message: "Property request not found",
                succeeded: false,
            });
            return;
        }
        new response_util_1.default(200, true, "Property request fetched successfully", res, result);
    }
    catch (error) {
        console.error("Get property request error:", error);
        next(new appError_1.InternalServerError("Failed to fetch property request."));
    }
});
exports.getPropertyRequestById = getPropertyRequestById;
const updatePropertyRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const data = req.body;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    if (!id) {
        res.status(400).json({
            status: "failed",
            message: "Property request ID is required",
            succeeded: false,
        });
        return;
    }
    try {
        const result = yield propertyService.updatePropertyRequest(id, data, userId);
        new response_util_1.default(200, true, "Property request updated successfully", res, result);
    }
    catch (error) {
        console.error("Update property request error:", error);
        next(new appError_1.InternalServerError("Failed to update property request."));
    }
});
exports.updatePropertyRequest = updatePropertyRequest;
const deletePropertyRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    if (!id) {
        res.status(400).json({
            status: "failed",
            message: "Property request ID is required",
            succeeded: false,
        });
        return;
    }
    try {
        yield propertyService.deletePropertyRequest(id, userId);
        new response_util_1.default(200, true, "Property request deleted successfully", res);
    }
    catch (error) {
        console.error("Delete property request error:", error);
        next(new appError_1.InternalServerError("Failed to delete property request."));
    }
});
exports.deletePropertyRequest = deletePropertyRequest;
