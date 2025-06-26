"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestPropertyService = void 0;
const appError_1 = require("../../../lib/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RequestPropertyService {
    constructor() {
        this.prisma = prisma;
    }
    async createPropertyRequest(name, email, phone_number, property_category, property_type, furnishing_status, country, state, number_of_bedrooms, number_of_bathrooms, budget, property_description, userId) {
        try {
            const data = {
                name,
                email,
                phone_number,
                property_category,
                property_type,
                furnishing_status,
                country,
                state,
                number_of_bedrooms,
                number_of_bathrooms,
                budget,
                property_description,
                userId,
                property_location: `${country}, ${state}`,
                neighborhood: "N/A",
            };
            const propertyRequest = await this.prisma.propertyRequest.create({
                data,
            });
            return { id: propertyRequest.id };
        }
        catch (error) {
            console.error("[createPropertyRequest] Error:", error);
            throw new appError_1.InternalServerError("Failed to create property request.");
        }
    }
    async getAllPropertyRequests(userId) {
        try {
            const propertyRequests = await this.prisma.propertyRequest.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    property_category: true,
                    property_type: true,
                    furnishing_status: true,
                    country: true,
                    state: true,
                    number_of_bedrooms: true,
                    number_of_bathrooms: true,
                    budget: true,
                    property_description: true,
                    userId: true,
                    property_location: true,
                    neighborhood: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const totalCount = await this.prisma.propertyRequest.count({
                where: { userId },
            });
            // Map schema fields to DTO fields
            const data = propertyRequests.map((req) => ({
                id: req.id,
                name: req.name,
                email: req.email,
                phone: req.phone_number,
                category: req.property_category,
                type: req.property_type,
                furnishingStatus: req.furnishing_status,
                country: req.country,
                state: req.state,
                numberOfBedrooms: req.number_of_bedrooms,
                numberOfBathrooms: req.number_of_bathrooms,
                budget: req.budget,
                additionalNote: req.property_description,
                userId: req.userId,
                property_location: req.property_location,
                neighborhood: req.neighborhood,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
            }));
            return { data, totalCount };
        }
        catch (error) {
            console.error("[getAllPropertyRequests] Error:", error);
            throw new appError_1.InternalServerError("Failed to fetch property requests.");
        }
    }
    async getPropertyRequestById(id, userId) {
        try {
            const propertyRequest = await this.prisma.propertyRequest.findFirst({
                where: { id, userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    property_category: true,
                    property_type: true,
                    furnishing_status: true,
                    country: true,
                    state: true,
                    number_of_bedrooms: true,
                    number_of_bathrooms: true,
                    budget: true,
                    property_description: true,
                    userId: true,
                    property_location: true,
                    neighborhood: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!propertyRequest)
                return null;
            // Map schema fields to DTO fields
            return {
                id: propertyRequest.id,
                name: propertyRequest.name,
                email: propertyRequest.email,
                phone: propertyRequest.phone_number,
                category: propertyRequest.property_category,
                type: propertyRequest.property_type,
                furnishingStatus: propertyRequest.furnishing_status,
                country: propertyRequest.country,
                state: propertyRequest.state,
                numberOfBedrooms: propertyRequest.number_of_bedrooms,
                numberOfBathrooms: propertyRequest.number_of_bathrooms,
                budget: propertyRequest.budget,
                additionalNote: propertyRequest.property_description,
                userId: propertyRequest.userId,
                property_location: propertyRequest.property_location,
                neighborhood: propertyRequest.neighborhood,
                createdAt: propertyRequest.createdAt,
                updatedAt: propertyRequest.updatedAt,
            };
        }
        catch (error) {
            console.error("[getPropertyRequestById] Error:", error);
            throw new appError_1.InternalServerError("Failed to fetch property request.");
        }
    }
}
exports.RequestPropertyService = RequestPropertyService;
