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
exports.calculateProjectMortgage = exports.getRecentProjects = exports.getFeaturedProjects = void 0;
const fetchedProperties_1 = require("../services/fetchedProperties");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const projectService = new fetchedProperties_1.ProjectService();
const getFeaturedProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const featured = yield projectService.getFeaturedProjects(page, limit);
        new response_util_1.default(200, true, "Featured projects fetched successfully", res, featured);
    }
    catch (error) {
        console.error("Featured projects fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch featured projects."));
    }
});
exports.getFeaturedProjects = getFeaturedProjects;
const getRecentProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const filter = {
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            propertyType: req.query.propertyType,
            bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
            bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const recent = yield projectService.getRecentProjects(filter);
        new response_util_1.default(200, true, "Recent projects fetched successfully", res, recent);
    }
    catch (error) {
        console.error("Recent projects fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch recent projects."));
    }
});
exports.getRecentProjects = getRecentProjects;
// export const getProjectById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const id = req.params.id as string;
//     if (!id) {
//       res.status(400).json({
//         status: "failed",
//         message: "Project ID is required",
//         succeeded: false,
//       });
//       return;
//     }
//     const project = await projectService.getProjectById(id);
//     new CustomResponse(200, true, "Project fetched successfully", res, project);
//   } catch (error) {
//     console.error("Project fetch error:", error);
//     next(new InternalServerError("Failed to fetch project."));
//   }
// };
const calculateProjectMortgage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        const id = req.params.id;
        if (!id) {
            res.status(400).json({
                status: "failed",
                message: "Project ID is required",
                succeeded: false,
            });
            return;
        }
        // Extract and validate down_payment from request body
        const downPayment = (_b = req.body) === null || _b === void 0 ? void 0 : _b.down_payment;
        if (typeof downPayment === "undefined") {
            res.status(400).json({
                status: "failed",
                message: "Down payment is required",
                succeeded: false,
            });
            return;
        }
        const downPaymentNum = Number(downPayment);
        if (isNaN(downPaymentNum)) {
            res.status(400).json({
                status: "failed",
                message: "Down payment must be a valid number",
                succeeded: false,
            });
            return;
        }
        const mortgage = yield projectService.calculateMortgage(id, downPaymentNum);
        new response_util_1.default(200, true, "Mortgage calculated successfully", res, mortgage);
    }
    catch (error) {
        console.error("Mortgage calculation error:", error);
        next(new appError_1.InternalServerError("Failed to calculate mortgage."));
    }
});
exports.calculateProjectMortgage = calculateProjectMortgage;
