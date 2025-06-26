"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class PropertyService {
    constructor() {
        this.prisma = prisma;
    }
    async getAllPropertyRequests(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const requests = await this.prisma.propertyRequest.findMany({
                where: { userId },
                take: limit,
                skip,
                orderBy: { createdAt: "desc" },
            });
            const totalCount = await this.prisma.propertyRequest.count({
                where: { userId },
            });
            return { data: requests, totalCount };
        }
        catch (error) {
            console.error("[getAllPropertyRequests] Error:", error);
            throw new appError_1.InternalServerError("Failed to fetch property requests.");
        }
    }
    async getPropertyRequestById(id, userId) {
        try {
            const request = await this.prisma.propertyRequest.findUnique({
                where: { id, userId },
            });
            return request;
        }
        catch (error) {
            console.error("[getPropertyRequestById] Error:", error);
            throw new appError_1.InternalServerError("Failed to fetch property request.");
        }
    }
    async updatePropertyRequest(id, data, userId) {
        try {
            const updatedRequest = await this.prisma.propertyRequest.update({
                where: { id, userId },
                data: { ...data, updatedAt: new Date() },
            });
            return updatedRequest;
        }
        catch (error) {
            console.error("[updatePropertyRequest] Error:", error);
            throw new appError_1.InternalServerError("Failed to update property request.");
        }
    }
    async deletePropertyRequest(id, userId) {
        try {
            await this.prisma.propertyRequest.delete({
                where: { id, userId },
            });
        }
        catch (error) {
            console.error("[deletePropertyRequest] Error:", error);
            throw new appError_1.InternalServerError("Failed to delete property request.");
        }
    }
}
exports.PropertyService = PropertyService;
