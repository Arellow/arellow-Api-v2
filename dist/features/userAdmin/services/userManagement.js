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
    getPropertyDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const property = yield prisma.project.findUnique({
                    where: { id },
                });
                if (!property) {
                    throw new appError_1.NotFoundError("Property not found.");
                }
                return {
                    id: property.id,
                    category: property.category,
                    title: property.title,
                    description: property.description,
                    features: property.features || [],
                    amenities: property.amenities || [],
                    property_location: property.property_location,
                    neighborhood: property.neighborhood,
                    number_of_bedrooms: property.number_of_bedrooms,
                    number_of_bathrooms: property.number_of_bathrooms,
                    number_of_floors: property.number_of_floors,
                    square: property.square,
                    price: property.price,
                    outside_view_images: property.outside_view_images || [],
                    living_room_images: property.living_room_images || [],
                    kitchen_room_images: property.kitchen_room_images || [],
                    primary_room_images: property.primary_room_images || [],
                    floor_plan_images: property.floor_plan_images || [],
                    tour_3d_images: property.tour_3d_images || [],
                    other_images: property.other_images || [],
                    banner: property.banner,
                    youTube_link: property.youTube_link,
                    youTube_thumbnail: property.youTube_thumbnail,
                    property_type: property.property_type,
                    listing_type: property.listing_type,
                    property_status: property.property_status,
                    property_age: property.property_age,
                    furnishing: property.furnishing,
                    parking_spaces: property.parking_spaces,
                    total_floors: property.total_floors,
                    available_floor: property.available_floor,
                    facing_direction: property.facing_direction,
                    street_width: property.street_width,
                    plot_area: property.plot_area,
                    construction_status: property.construction_status,
                    possession_status: property.possession_status,
                    transaction_type: property.transaction_type,
                    ownership_type: property.ownership_type,
                    expected_pricing: property.expected_pricing,
                    price_per_sqft: property.price_per_sqft,
                    booking_amount: property.booking_amount,
                    maintenance_monthly: property.maintenance_monthly,
                    price_negotiable: property.price_negotiable,
                    available_from: property.available_from,
                    longitude: property.longitude,
                    latitude: property.latitude,
                    distance_between_facility: property.distance_between_facility,
                    country: property.country,
                    region: property.region,
                    city: property.city,
                    views: property.views,
                    archive: property.archive,
                    status: property.status,
                    isapproved: property.isapproved,
                    rejectreason: property.rejectreason,
                    createdAt: property.createdAt,
                };
            }
            catch (error) {
                console.error("[getPropertyDetails] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when fetching property details.");
            }
        });
    }
    deleteProperty(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const property = yield prisma.project.findUnique({
                    where: { id },
                });
                if (!property) {
                    throw new appError_1.NotFoundError("Property not found.");
                }
                yield prisma.project.delete({
                    where: { id },
                });
            }
            catch (error) {
                console.error("[deleteProperty] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when deleting property.");
            }
        });
    }
}
exports.ListingService = ListingService;
