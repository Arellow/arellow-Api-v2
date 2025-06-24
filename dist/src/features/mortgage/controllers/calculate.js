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
exports.calculateCustomMortgage = void 0;
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const calculate_1 = require("../services/calculate");
const projectService = new calculate_1.ProjectService();
const calculateCustomMortgage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { homeLocation, homePrice, downPayment, saveAndContinue } = req.body;
        // Basic validation
        if (!homeLocation || !homePrice || !downPayment) {
            res.status(400).json({
                status: "failed",
                message: "homeLocation, homePrice, and downPayment are required",
                succeeded: false,
            });
            return;
        }
        if (saveAndContinue) {
            // Save as draft
            const result = yield projectService.saveMortgageDraft(homeLocation, Number(homePrice), Number(downPayment), userId);
            new response_util_1.default(200, true, "Mortgage draft saved, you can continue later", res, result);
        }
        else {
            // Calculate full mortgage
            const result = yield projectService.calculateCustomMortgage(homeLocation, Number(homePrice), Number(downPayment));
            new response_util_1.default(200, true, "Mortgage calculated successfully", res, result);
        }
    }
    catch (error) {
        console.error("Custom mortgage calculation error:", error);
        next(new appError_1.InternalServerError("Failed to calculate mortgage."));
    }
});
exports.calculateCustomMortgage = calculateCustomMortgage;
