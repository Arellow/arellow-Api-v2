"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProjectMortgage = void 0;
const fetchedProperties_1 = require("../services/fetchedProperties");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const projectService = new fetchedProperties_1.ProjectService();
// export const getFeaturedProjects = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const page = req.query.page ? parseInt(req.query.page as string) : 1;
//     const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
//     const featured = await projectService.getFeaturedProjects(page, limit);
//     new CustomResponse(200, true, "Featured projects fetched successfully", res, featured);
//   } catch (error) {
//     console.error("Featured projects fetch error:", error);
//     next(new InternalServerError("Failed to fetch featured projects."));
//   }
// };
// export const getRecentProjects = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?.id as string;
//   try {
//     const filter: ProjectFilterDto = {
//       minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
//       maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
//       propertyType: req.query.propertyType as string,
//       bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
//       bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
//       page: req.query.page ? parseInt(req.query.page as string) : 1,
//       limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
//     };
//     const recent = await projectService.getRecentProjects(filter);
//     new CustomResponse(200, true, "Recent projects fetched successfully", res, recent);
//   } catch (error) {
//     console.error("Recent projects fetch error:", error);
//     next(new InternalServerError("Failed to fetch recent projects."));
//   }
// };
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
const calculateProjectMortgage = async (req, res, next) => {
    const userId = req.user?.id;
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
        const downPayment = req.body?.down_payment;
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
        const mortgage = await projectService.calculateMortgage(id, downPaymentNum);
        new response_util_1.default(200, true, "Mortgage calculated successfully", res, mortgage);
    }
    catch (error) {
        console.error("Mortgage calculation error:", error);
        next(new appError_1.InternalServerError("Failed to calculate mortgage."));
    }
};
exports.calculateProjectMortgage = calculateProjectMortgage;
