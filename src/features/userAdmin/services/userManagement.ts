import { InternalServerError, NotFoundError } from "../../../lib/appError";
import { ListingQueryDto, ListingResponseDto, PropertyResponseDto } from "../dtos/userManagement";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class ListingService {


async getUserListings(userId: string, query: ListingQueryDto): Promise<ListingResponseDto[]> {
    try {
      const {  requestCategory,propertyType,isapproved, country, state, search, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const orConditions: Prisma.ProjectWhereInput[] = search
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
      const whereClause: Prisma.ProjectWhereInput = {
        userId,
        ...(requestCategory && { category: { equals: requestCategory, mode: "insensitive" } }),
        ...(propertyType && { property_type: { equals: propertyType, mode: "insensitive" } }),
        ...(country && { country: { equals: country, mode: "insensitive" } }),
        ...(state && { region: { equals: state , mode: "insensitive"} }),
        ... (search && { OR: orConditions }), 
       ...(isapproved && { isapproved: { equals: isapproved } }), 
        ...(!isapproved && { isapproved: { in: ["approved", "pending", "rejected"] as const } })
      };

      const listings = await prisma.project.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: 10,
      });

      const totalCount = await prisma.project.count({
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
        status: listing.isapproved as "approved" | "pending" | "rejected",
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


  // async getPropertyDetails(id :string): Promise<PropertyResponseDto> {
  //   try {
      

  //     const property = await prisma.project.findUnique({
  //       where: { id },
  //     });

  //     if (!property) {
  //       throw  new NotFoundError("Property not found.");
  //     }

  //     return {
  //       id: property.id,
  //       category: property.category,
  //       title: property.title,
  //       description: property.description,
  //       features: property.features || [],
  //       amenities: property.amenities || [],
  //       property_location: property.property_location,
  //       neighborhood: property.neighborhood,
  //       number_of_bedrooms: property.number_of_bedrooms,
  //       number_of_bathrooms: property.number_of_bathrooms,
  //       number_of_floors: property.number_of_floors,
  //       square: property.square,
  //       price: property.price,
  //       outside_view_images: property.outside_view_images || [],
  //       living_room_images: property.living_room_images || [],
  //       kitchen_room_images: property.kitchen_room_images || [],
  //       primary_room_images: property.primary_room_images || [],
  //       floor_plan_images: property.floor_plan_images || [],
  //       tour_3d_images: property.tour_3d_images || [],
  //       other_images: property.other_images || [],
  //       banner: property.banner,
  //       youTube_link: property.youTube_link,
  //       youTube_thumbnail: property.youTube_thumbnail,
  //       property_type: property.property_type,
  //       listing_type: property.listing_type,
  //       property_status: property.property_status,
  //       property_age: property.property_age,
  //       furnishing: property.furnishing,
  //       parking_spaces: property.parking_spaces,
  //       total_floors: property.total_floors,
  //       available_floor: property.available_floor,
  //       facing_direction: property.facing_direction,
  //       street_width: property.street_width,
  //       plot_area: property.plot_area,
  //       construction_status: property.construction_status,
  //       possession_status: property.possession_status,
  //       transaction_type: property.transaction_type,
  //       ownership_type: property.ownership_type,
  //       expected_pricing: property.expected_pricing,
  //       price_per_sqft: property.price_per_sqft,
  //       booking_amount: property.booking_amount,
  //       maintenance_monthly: property.maintenance_monthly,
  //       price_negotiable: property.price_negotiable,
  //       available_from: property.available_from,
  //       longitude: property.longitude,
  //       latitude: property.latitude,
  //       distance_between_facility: property.distance_between_facility,
  //       country: property.country,
  //       region: property.region,
  //       city: property.city,
  //       views: property.views,
  //       archive: property.archive,
  //       status: property.status,
  //       isapproved: property.isapproved,
  //       rejectreason: property.rejectreason,
  //       createdAt: property.createdAt,
  //     };
  //   } catch (error) {
  //     console.error("[getPropertyDetails] Prisma error:", error);
  //     throw new InternalServerError("Database error when fetching property details.");
  //   }
  // }

  //  async deleteProperty(id: string): Promise<void> {
  //   try {
      

  //     const property = await prisma.project.findUnique({
  //       where: { id },
  //     });

  //     if (!property) {
  //       throw new NotFoundError("Property not found.");
  //     }

  //     await prisma.project.delete({
  //       where: { id },
  //     });
  //   } catch (error) {
  //     console.error("[deleteProperty] Prisma error:", error);
  //     throw new InternalServerError("Database error when deleting property.");
  //   }
  // }

}