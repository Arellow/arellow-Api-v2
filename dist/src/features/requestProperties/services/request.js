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
exports.RequestPropertyService = void 0;
const appError_1 = require("../../../lib/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RequestPropertyService {
    constructor() {
        this.prisma = prisma;
        // async getAllPropertyRequests(userId: string): Promise<PropertyRequestsResponse> {
        //     try {
        //       const propertyRequests = await this.prisma.propertyRequest.findMany({
        //         where: { userId },
        //         orderBy: { createdAt: "desc" },
        //         select: {
        //           id: true,
        //           name: true,
        //           email: true,
        //           phone_number: true,
        //           property_category: true,
        //           property_type: true,
        //           furnishing_status: true,
        //           country: true,
        //           number_of_bedrooms: true,
        //           number_of_bathrooms: true,
        //           budget: true,
        //           property_description: true,
        //           userId: true,
        //           property_location: true,
        //           neighborhood: true,
        //           createdAt: true,
        //           updatedAt: true,
        //         },
        //       });
        //       const totalCount = await this.prisma.propertyRequest.count({
        //         where: { userId },
        //       });
        //       // Type assertion to match PropertyRequest interface
        //       const typedRequests: PropertyRequest[] = propertyRequests.map((req) => ({
        //         ...req,
        //         category: req.property_category, 
        //         type: req.property_type, 
        //         furnishingStatus: req.furnishing_status, 
        //         additionalNote: req.property_description, 
        //         phone: req.phone_number, 
        //       }));
        //       return { data: typedRequests, totalCount };
        //     } catch (error) {
        //       console.error("[getAllPropertyRequests] Error:", error);
        //       throw new InternalServerError("Failed to fetch property requests.");
        //     }
        //   }
        // async getPropertyRequestById(id: string, userId: string): Promise<PropertyRequest | null> {
        //   try {
        //     const propertyRequest = await this.prisma.propertyRequest.findFirst({
        //       where: { id, userId },
        //       select: {
        //         id: true,
        //         name: true,
        //         email: true,
        //         phone_number: true,
        //         property_category: true,
        //         property_type: true,
        //         furnishing_status: true,
        //         country: true,
        //         number_of_bedrooms: true,
        //         number_of_bathrooms: true,
        //         budget: true,
        //         property_description: true,
        //         userId: true,
        //         property_location: true,
        //         neighborhood: true,
        //         createdAt: true,
        //         updatedAt: true,
        //       },
        //     });
        //     if (!propertyRequest) return null;
        //     // Type assertion to match PropertyRequest interface
        //     const typedRequest: PropertyRequest = {
        //       ...propertyRequest,
        //       category: propertyRequest.property_category,
        //       type: propertyRequest.property_type,
        //       furnishingStatus: propertyRequest.furnishing_status,
        //       additionalNote: propertyRequest.property_description,
        //       phone: propertyRequest.phone_number,
        //     };
        //     return typedRequest;
        //   } catch (error) {
        //     console.error("[getPropertyRequestById] Error:", error);
        //     throw new InternalServerError("Failed to fetch property request.");
        //   }
        // }
    }
    createPropertyRequest(name, email, phone_number, property_category, property_type, furnishing_status, country, state, number_of_bedrooms, number_of_bathrooms, budget, property_description, userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    neighborhood: "N/A"
                };
                const propertyRequest = yield this.prisma.propertyRequest.create({
                    data,
                });
                return { id: propertyRequest.id };
            }
            catch (error) {
                console.error("[createPropertyRequest] Error:", error);
                throw new appError_1.InternalServerError("Failed to create property request.");
            }
        });
    }
}
exports.RequestPropertyService = RequestPropertyService;
