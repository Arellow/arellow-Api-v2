"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePropertyRequest = exports.updatePropertyRequest = exports.getPropertyRequestById = exports.getAllPropertyRequests = void 0;
const requestProperty_1 = require("../services/requestProperty");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const propertyService = new requestProperty_1.PropertyService();
const getAllPropertyRequests = async (req, res, next) => {
    const userId = req.user?.id;
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
        const result = await propertyService.getAllPropertyRequests(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
        new response_util_1.default(200, true, "Property requests fetched successfully", res, result);
    }
    catch (error) {
        console.error("Get all property requests error:", error);
        next(new appError_1.InternalServerError("Failed to fetch property requests."));
    }
};
exports.getAllPropertyRequests = getAllPropertyRequests;
const getPropertyRequestById = async (req, res, next) => {
    const userId = req.user?.id;
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
        const result = await propertyService.getPropertyRequestById(id, userId);
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
};
exports.getPropertyRequestById = getPropertyRequestById;
const updatePropertyRequest = async (req, res, next) => {
    const userId = req.user?.id;
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
        const result = await propertyService.updatePropertyRequest(id, data, userId);
        new response_util_1.default(200, true, "Property request updated successfully", res, result);
    }
    catch (error) {
        console.error("Update property request error:", error);
        next(new appError_1.InternalServerError("Failed to update property request."));
    }
};
exports.updatePropertyRequest = updatePropertyRequest;
const deletePropertyRequest = async (req, res, next) => {
    const userId = req.user?.id;
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
        await propertyService.deletePropertyRequest(id, userId);
        new response_util_1.default(200, true, "Property request deleted successfully", res);
    }
    catch (error) {
        console.error("Delete property request error:", error);
        next(new appError_1.InternalServerError("Failed to delete property request."));
    }
};
exports.deletePropertyRequest = deletePropertyRequest;
