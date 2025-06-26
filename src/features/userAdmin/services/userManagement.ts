
import { InternalServerError, NotFoundError } from "../../../lib/appError";
import { ListingQueryDto, ListingResponseDto, PropertyResponseDto } from "../dtos/userManagement";
import { Prisma, PrismaClient, PropertyStatus } from "@prisma/client";
const prisma = new PrismaClient();

export class ListingService {
  async getUserListings(userId: string, query: ListingQueryDto): Promise<ListingResponseDto[]> {
    try {
      const { country, state, isapproved, search, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const orConditions: Prisma.PropertyWhereInput[] = search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { neighborhood: { contains: search, mode: "insensitive" } },
          ]
        : [];

      const whereClause: Prisma.PropertyWhereInput = {
        userId,
        ...(country && { country: { equals: country, mode: "insensitive" } }),
        ...(state && { state: { equals: state, mode: "insensitive" } }),
        ...(search && { OR: orConditions }),
        ...(isapproved && { status: { equals: isapproved } }),
        ...(!isapproved && { status: { in: [PropertyStatus.APPROVED, PropertyStatus.PENDING, PropertyStatus.REJECTED] } }),
      };

      const listings = await prisma.property.findMany({
        where: whereClause,
        include: { media: true, amenities: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const totalCount = await prisma.property.count({
        where: whereClause,
      });

      return listings.map(listing => ({
        id: listing.id,
        propertyName: listing.title || null,
        propertyType: listing.category || null,
        price: listing.price || null,
        location: [listing.country, listing.state, listing.city, listing.neighborhood].filter(Boolean).join(", ") || null,
        listingDate: listing.createdAt,
        propertyImage: listing.media.find(m => m.photoType === "FRONT_VIEW")?.url || null,
        status: listing.status,
        totalCount,
      }));
    } catch (error) {
      console.error("[getUserListings] Prisma error:", error);
      if (error instanceof Error) {
        throw new InternalServerError(`Database error when fetching user listings: ${error.message}`);
      }
      throw new InternalServerError("Unknown database error when fetching user listings.");
    }
  }

  async getPropertyDetails(id: string): Promise<PropertyResponseDto> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { media: true, amenities: true },
      });

      if (!property) {
        throw new NotFoundError("Property not found.");
      }

      return {
        id: property.id,
        category: property.category || null,
        title: property.title || null,
        description: property.description || null,
        features: property.features || [],
        amenities: property.amenities.map(a => a.name) || [],
        neighborhood: property.neighborhood || null,
        number_of_bedrooms: property.bedrooms || null,
        number_of_bathrooms: property.bathrooms || null,
        number_of_floors: property.floors || null,
        square: property.squareMeters || null,
        price: property.price || null,
        longitude: property.location?.lng?.toString() || null,
        latitude: property.location?.lat?.toString() || null,
        country: property.country || null,
        city: property.city || null,
        views: property.likesCount,
        archive: property.archived,
        status: property.salesStatus as "selling" | "rent" | "sold",
        isapproved: property.status,
        rejectreason: property.rejectionReason || null,
        createdAt: property.createdAt,
      };
    } catch (error) {
      console.error("[getPropertyDetails] Prisma error:", error);
      throw new InternalServerError("Database error when fetching property details.");
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        throw new NotFoundError("Property not found.");
      }

      await prisma.property.delete({
        where: { id },
      });
    } catch (error) {
      console.error("[deleteProperty] Prisma error:", error);
      throw new InternalServerError("Database error when deleting property.");
    }
  }
}