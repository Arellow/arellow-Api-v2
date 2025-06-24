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
exports.ListingService = void 0;
const appError_1 = require("../../../lib/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ListingService {
    getUserListings(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestCategory, propertyType, isapproved, country, state, search, page = 1, limit = 10 } = query;
                const skip = (page - 1) * limit;
                const orConditions = search
                    ? [
                        { title: { contains: search, mode: "insensitive" } },
                        { property_type: { contains: search, mode: "insensitive" } },
                        { property_location: { contains: search, mode: "insensitive" } },
                        { country: { contains: search, mode: "insensitive" } },
                        { region: { contains: search, mode: "insensitive" } },
                        { city: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ]
                    : [];
                // Construct where clause with explicit typing
                const whereClause = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ userId }, (requestCategory && { category: { equals: requestCategory, mode: "insensitive" } })), (propertyType && { property_type: { equals: propertyType, mode: "insensitive" } })), (country && { country: { equals: country, mode: "insensitive" } })), (state && { region: { equals: state, mode: "insensitive" } })), (search && { OR: orConditions })), (isapproved && { isapproved: { equals: isapproved } })), (!isapproved && { isapproved: { in: ["approved", "pending", "rejected"] } }));
                const listings = yield prisma.project.findMany({
                    where: whereClause,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: 10,
                });
                const totalCount = yield prisma.project.count({
                    where: whereClause,
                });
                return listings.map(listing => ({
                    id: listing.id,
                    propertyName: listing.title || null,
                    propertyType: listing.property_type || null,
                    price: listing.price || null,
                    location: listing.property_location || null,
                    listingDate: listing.createdAt,
                    propertyImage: listing.outside_view_images[0] || null,
                    status: listing.isapproved,
                    totalCount,
                }));
            }
            catch (error) {
                console.error("[getUserListings] Prisma error:", error);
                if (error instanceof Error) {
                    throw new appError_1.InternalServerError(`Database error when fetching user listings: ${error.message}`);
                }
                throw new appError_1.InternalServerError("Unknown database error when fetching user listings.");
            }
        });
    }
}
exports.ListingService = ListingService;
