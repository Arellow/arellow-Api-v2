"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma = new client_1.PrismaClient();
class PropertyService {
    constructor() {
        this.prisma = prisma;
    }
    async createPreQualification(data, userId) {
        try {
            const preQualification = await this.prisma.preQualification.create({
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
    }
    async getAllPreQualifications(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const requests = await this.prisma.preQualification.findMany({
                where: { userId },
                take: limit,
                skip,
                orderBy: { createdAt: "desc" },
            });
            const totalCount = await this.prisma.preQualification.count({ where: { userId } });
            return { data: requests, totalCount };
        }
        catch (error) {
            console.error("[getAllPreQualifications] Error:", error);
            throw new appError_1.InternalServerError("Failed to fetch pre-qualification requests.");
        }
    }
    async getPreQualificationById(id, userId) {
        try {
            const request = await this.prisma.preQualification.findUnique({
                where: { id, userId },
            });
            return request;
        }
        catch (error) {
            console.error("[getPreQualificationById] Error:", error);
            throw new appError_1.InternalServerError("Failed to fetch pre-qualification request.");
        }
    }
    async updatePreQualification(id, data, userId) {
        try {
            const updatedRequest = await this.prisma.preQualification.update({
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
    }
    async deletePreQualification(id, userId) {
        try {
            await this.prisma.preQualification.delete({
                where: { id, userId },
            });
        }
        catch (error) {
            console.error("[deletePreQualification] Error:", error);
            throw new appError_1.InternalServerError("Failed to delete pre-qualification request.");
        }
    }
}
exports.PropertyService = PropertyService;
