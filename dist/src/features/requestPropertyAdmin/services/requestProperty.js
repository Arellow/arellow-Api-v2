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
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class PropertyService {
    constructor() {
        this.prisma = prisma;
    }
    getAllPropertyRequests(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const requests = yield this.prisma.propertyRequest.findMany({
                    where: { userId },
                    take: limit,
                    skip,
                    orderBy: { createdAt: "desc" },
                });
                const totalCount = yield this.prisma.propertyRequest.count({
                    where: { userId },
                });
                return { data: requests, totalCount };
            }
            catch (error) {
                console.error("[getAllPropertyRequests] Error:", error);
                throw new appError_1.InternalServerError("Failed to fetch property requests.");
            }
        });
    }
    getPropertyRequestById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield this.prisma.propertyRequest.findUnique({
                    where: { id, userId },
                });
                return request;
            }
            catch (error) {
                console.error("[getPropertyRequestById] Error:", error);
                throw new appError_1.InternalServerError("Failed to fetch property request.");
            }
        });
    }
    updatePropertyRequest(id, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedRequest = yield this.prisma.propertyRequest.update({
                    where: { id, userId },
                    data: Object.assign(Object.assign({}, data), { updatedAt: new Date() }),
                });
                return updatedRequest;
            }
            catch (error) {
                console.error("[updatePropertyRequest] Error:", error);
                throw new appError_1.InternalServerError("Failed to update property request.");
            }
        });
    }
    deletePropertyRequest(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.propertyRequest.delete({
                    where: { id, userId },
                });
            }
            catch (error) {
                console.error("[deletePropertyRequest] Error:", error);
                throw new appError_1.InternalServerError("Failed to delete property request.");
            }
        });
    }
}
exports.PropertyService = PropertyService;
