"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePreQualification = exports.updatePreQualification = exports.getPreQualificationById = exports.getAllPreQualifications = exports.createPreQualification = void 0;
const service_1 = require("./service");
const appError_1 = require("../../lib/appError");
const response_util_1 = __importDefault(require("../../utils/helpers/response.util"));
const propertyService = new service_1.PropertyService();
const createPreQualification = async (req, res, next) => {
    const userId = req.user?.id;
    const data = req.body;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const result = await propertyService.createPreQualification(data, userId);
        // Email options for the user
        // const userMailOptions = await createPreQualificationMailOptions(
        //   data.email,
        //   data.name,
        //   data.email,
        //   data.phone,
        //   data.state,
        //   data.city,
        //   data.property_category,
        //   data.neighbourhood ,
        //   data.monthly_budget,
        //   data.down_payment_goal,
        //   false 
        // );
        // await nodeMailerController(userMailOptions);
        // // Email options for the admin
        // const adminMailOptions = await createPreQualificationMailOptions(
        //   process.env.ADMIN_EMAIL || "",
        //   data.name,
        //   data.email,
        //   data.phone,
        //   data.state,
        //   data.city,
        //   data.property_category,
        //   data.neighbourhood,
        //   data.monthly_budget,
        //   data.down_payment_goal,
        //   true 
        // );
        // await nodeMailerController(adminMailOptions);
        new response_util_1.default(201, true, "Pre-qualification request created successfully", res, result);
    }
    catch (error) {
        console.error("Create pre-qualification request error:", error);
        next(new appError_1.InternalServerError("Failed to create pre-qualification request."));
    }
};
exports.createPreQualification = createPreQualification;
const getAllPreQualifications = async (req, res, next) => {
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
        const result = await propertyService.getAllPreQualifications(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
        new response_util_1.default(200, true, "Pre-qualification requests fetched successfully", res, result);
    }
    catch (error) {
        console.error("Get all pre-qualification requests error:", error);
        next(new appError_1.InternalServerError("Failed to fetch pre-qualification requests."));
    }
};
exports.getAllPreQualifications = getAllPreQualifications;
const getPreQualificationById = async (req, res, next) => {
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
            message: "Pre-qualification request ID is required",
            succeeded: false,
        });
        return;
    }
    try {
        const result = await propertyService.getPreQualificationById(id, userId);
        if (!result) {
            res.status(404).json({
                status: "failed",
                message: "Pre-qualification request not found",
                succeeded: false,
            });
            return;
        }
        new response_util_1.default(200, true, "Pre-qualification request fetched successfully", res, result);
    }
    catch (error) {
        console.error("Get pre-qualification request error:", error);
        next(new appError_1.InternalServerError("Failed to fetch pre-qualification request."));
    }
};
exports.getPreQualificationById = getPreQualificationById;
const updatePreQualification = async (req, res, next) => {
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
            message: "Pre-qualification request ID is required",
            succeeded: false,
        });
        return;
    }
    try {
        const result = await propertyService.updatePreQualification(id, data, userId);
        new response_util_1.default(200, true, "Pre-qualification request updated successfully", res, result);
    }
    catch (error) {
        console.error("Update pre-qualification request error:", error);
        next(new appError_1.InternalServerError("Failed to update pre-qualification request."));
    }
};
exports.updatePreQualification = updatePreQualification;
const deletePreQualification = async (req, res, next) => {
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
            message: "Pre-qualification request ID is required",
            succeeded: false,
        });
        return;
    }
    try {
        await propertyService.deletePreQualification(id, userId);
        new response_util_1.default(200, true, "Pre-qualification request deleted successfully", res);
    }
    catch (error) {
        console.error("Delete pre-qualification request error:", error);
        next(new appError_1.InternalServerError("Failed to delete pre-qualification request."));
    }
};
exports.deletePreQualification = deletePreQualification;
