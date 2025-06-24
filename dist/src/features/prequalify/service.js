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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma = new client_1.PrismaClient();
class PropertyService {
    constructor() {
        this.prisma = prisma;
    }
    createPreQualification(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const preQualification = yield this.prisma.preQualification.create({
                    data: {
                        name: data.name,
                        role: data.role || null,
                        email: data.email,
                        phone: data.phone,
                        home_address: data.home_address || null,
                        state: data.state,
                        city: data.city,
                        property_category: data.property_category,
                        neighbourhood: data.neighbourhood || null,
                        monthly_budget: data.monthly_budget,
                        down_payment_goal: data.down_payment_goal,
                        business_or_civil: data.business_or_civil || null,
                        employer_name: data.employer_name || null,
                        level_of_employment: data.level_of_employment || null,
                        bank_name: data.bank_name || null,
                        userId,
                    },
                });
                return preQualification;
            }
            catch (error) {
                console.error("[createPreQualification] Error:", error);
                throw new appError_1.InternalServerError("Failed to create pre-qualification request.");
            }
        });
    }
    getAllPreQualifications(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const requests = yield this.prisma.preQualification.findMany({
                    where: { userId },
                    take: limit,
                    skip,
                    orderBy: { createdAt: "desc" },
                });
                const totalCount = yield this.prisma.preQualification.count({ where: { userId } });
                return { data: requests, totalCount };
            }
            catch (error) {
                console.error("[getAllPreQualifications] Error:", error);
                throw new appError_1.InternalServerError("Failed to fetch pre-qualification requests.");
            }
        });
    }
    getPreQualificationById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.prisma.preQualification.findUnique({
                    where: { id, userId },
                });
                return request;
            }
            catch (error) {
                console.error("[getPreQualificationById] Error:", error);
                throw new appError_1.InternalServerError("Failed to fetch pre-qualification request.");
            }
        });
    }
    updatePreQualification(id, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedRequest = yield this.prisma.preQualification.update({
                    where: { id, userId },
                    data: {
                        name: data.name,
                        role: data.role || null,
                        email: data.email,
                        phone: data.phone,
                        home_address: data.home_address || null,
                        state: data.state,
                        city: data.city,
                        property_category: data.property_category,
                        neighbourhood: data.neighbourhood || null,
                        monthly_budget: data.monthly_budget,
                        down_payment_goal: data.down_payment_goal,
                        business_or_civil: data.business_or_civil || null,
                        employer_name: data.employer_name || null,
                        level_of_employment: data.level_of_employment || null,
                        bank_name: data.bank_name || null,
                    },
                });
                return updatedRequest;
            }
            catch (error) {
                console.error("[updatePreQualification] Error:", error);
                throw new appError_1.InternalServerError("Failed to update pre-qualification request.");
            }
        });
    }
    deletePreQualification(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.preQualification.delete({
                    where: { id, userId },
                });
            }
            catch (error) {
                console.error("[deletePreQualification] Error:", error);
                throw new appError_1.InternalServerError("Failed to delete pre-qualification request.");
            }
        });
    }
}
exports.PropertyService = PropertyService;
