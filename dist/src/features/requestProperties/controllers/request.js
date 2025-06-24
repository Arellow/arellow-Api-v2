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
exports.createPropertyRequest = void 0;
const request_1 = require("../services/request");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const projectService = new request_1.RequestPropertyService();
const createPropertyRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const { name, email, phone, category, type, furnishingStatus, country, city, numberOfBedrooms, numberOfBathrooms, budget, additionalNote, } = req.body;
        // Basic validation
        if (!name || !email || !phone || !category || !type || !furnishingStatus || !country || !city || !numberOfBedrooms || !numberOfBathrooms || !budget) {
            res.status(400).json({
                status: "failed",
                message: "All required fields must be provided",
                succeeded: false,
            });
            return;
        }
        const result = yield projectService.createPropertyRequest(name, email, phone, category, type, furnishingStatus, country, city, numberOfBedrooms, numberOfBathrooms, budget, additionalNote || null, userId);
        // Email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || "uche.ali.tech@gmail.com";
        const adminMailOptions = yield (0, mailer_1.createPropertyRequestMailOptions)(adminEmail, name, email, phone, category, type, furnishingStatus, country, city, numberOfBedrooms, numberOfBathrooms, budget, additionalNote, true);
        yield (0, nodemailer_1.nodeMailerController)(adminMailOptions);
        // Email to User
        const userMailOptions = yield (0, mailer_1.createPropertyRequestMailOptions)(email, name, email, phone, category, type, furnishingStatus, country, city, numberOfBedrooms, numberOfBathrooms, budget, additionalNote);
        yield (0, nodemailer_1.nodeMailerController)(userMailOptions);
        new response_util_1.default(201, true, "Property request created successfully", res, result);
    }
    catch (error) {
        console.error("Property request creation error:", error);
        next(new appError_1.InternalServerError("Failed to create property request."));
    }
});
exports.createPropertyRequest = createPropertyRequest;
