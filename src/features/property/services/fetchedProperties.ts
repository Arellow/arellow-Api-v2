import { Prisma, PrismaClient } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import { ProjectFilterDto, FeaturedResponse, RecentResponse, ProjectPost, SingleProjectResponse, UserDetails, MortgageCalculation } from "../dtos/property.dto";

const prisma = new PrismaClient();

export class ProjectService {
  private prisma: PrismaClient = prisma;

  // async getFeaturedProjects(page: number = 1, limit: number = 5, userId?: string): Promise<FeaturedResponse> {
  //   try {
  //     const skip = (page - 1) * limit;

  //     const whereClause: Prisma.ProjectWhereInput = {
  //       isFeatured: true,
  //       archive: false,
  //       status: "selling",
  //       isapproved: "approved",
  //     };

  //     const featured = await this.prisma.project.findMany({
  //       where: whereClause,
  //       take: limit,
  //       skip,
  //       orderBy: { createdAt: "desc" },
  //       include: {
  //         _count: {
  //           select: { likes: true }, 
  //         },
  //       },
  //     });

  //     const totalCount = await this.prisma.project.count({ where: whereClause });

  //     const data: ProjectPost[] = await Promise.all(
  //       featured.map(async (p) => {
  //         const isLiked = userId
  //           ? await this.prisma.likeUser.findUnique({
  //               where: { userId_projectId: { userId, projectId: p.id } },
  //             }) !== null
  //           : false; 

  //         return {
  //           id: p.id,
  //           title: p.title || "",
  //           price: p.price || 0,
  //           property_type: p.property_type || "",
  //           number_of_bedrooms: p.number_of_bedrooms || 0,
  //           number_of_bathrooms: p.number_of_bathrooms || 0,
  //           outside_view_images: p.outside_view_images || [],
  //           banner: p.banner,
  //           createdAt: p.createdAt,
  //           likeCount: p._count.likes || 0,
  //           isLiked,
  //         };
  //       })
  //     );

  //     return { data, totalCount };
  //   } catch (error) {
  //     console.error("[getFeaturedProjects] Prisma error:", error);
  //     throw new InternalServerError("Failed to fetch featured projects.");
  //   }
  // }



  // async getRecentProjects(filter: ProjectFilterDto, userId?: string): Promise<RecentResponse> {
  //   try {
  //     const { minPrice, maxPrice, propertyType, bedrooms, bathrooms, page = 1, limit = 10 } = filter;
  //     const skip = (page - 1) * limit;

  //     const whereClause: Prisma.PropertyWhereInput = {
  //       price: {
  //         ...(minPrice !== undefined && { gte: minPrice }),
  //         ...(maxPrice !== undefined && { lte: maxPrice }),
  //       },
  //       category: propertyType ? { equals: propertyType, mode: "insensitive" } : undefined,
  //       bedrooms: bedrooms ? { equals: bedrooms } : undefined,
  //       bathrooms: bathrooms ? { equals: bathrooms } : undefined,
  //       archived: false,
  //       salesStatus: "SELLING",
  //       status: "APPROVED",
  //     };

  //     const recent = await this.prisma.property.findMany({
  //       where: whereClause,
  //       take: limit,
  //       skip,
  //       orderBy: { createdAt: "desc" },
  //       include: {
  //         _count: {
  //           select: { likedBy: true }, 
  //         },
  //       },
  //     });

  //     const totalCount = await this.prisma.property.count({ where: whereClause });

  //     const data: ProjectPost[] = await Promise.all(
  //       recent.map(async (p) => {
  //         const isLiked = userId
  //           ? await this.prisma.likeUser.findUnique({
  //               where: { userId_projectId: { userId, projectId: p.id } },
  //             }) !== null
  //           : false; 

  //         return {
  //           id: p.id,
  //           title: p.title || "",
  //           price: p.price || 0,
  //           property_type: p.property_type || "",
  //           number_of_bedrooms: p.number_of_bedrooms || 0,
  //           number_of_bathrooms: p.number_of_bathrooms || 0,
  //           outside_view_images: p.outside_view_images || [],
  //           banner: p.banner,
  //           createdAt: p.createdAt,
  //           likeCount: p._count.likes || 0,
  //           isLiked, // Added isLiked status
  //         };
  //       })
  //     );

  //     return { data, totalCount };
  //   } catch (error) {
  //     console.error("[getRecentProjects] Prisma error:", error);
  //     throw new InternalServerError("Failed to fetch recent projects.");
  //   }
  // }

//  async getProjectById(id: string): Promise<SingleProjectResponse> {
//     try {
//       const project = await this.prisma.project.findUnique({
//         where: { id },
//         include: {
//           user: {
//             select: {
//               id: true,
//               fullname: true, 
//               email: true,
//               createdAt: true,
//             },
//           },
//         },
//       });

//       if (!project) {
//         throw new InternalServerError("Project not found.");
//       }

//       const currentDate = new Date();
//       const createdAt = project.user.createdAt || new Date(); 
//       const timeDiff = currentDate.getTime() - createdAt.getTime();
//       const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365)); 
//       const yearsOnPlatform = years > 0 ? years : 1;

//       const agent: UserDetails = {
//         id: project.user.id,
//         fullname: project.user.fullname,
//         email: project.user.email,
//         createdAt: project.user.createdAt,
//         yearsOnPlatform 
//       };

//       const data: SingleProjectResponse = {
//         id: project.id,
//         category: project.category,
//         title: project.title,
//         description: project.description,
//         features: project.features || [],
//         amenities: project.amenities || [],
//         property_location: project.property_location,
//         neighborhood: project.neighborhood,
//         number_of_bedrooms: project.number_of_bedrooms || 0,
//         number_of_bathrooms: project.number_of_bathrooms || 0,
//         number_of_floors: project.number_of_floors,
//         square: project.square,
//         price: project.price,
//         outside_view_images: project.outside_view_images || [],
//         living_room_images: project.living_room_images || [],
//         kitchen_room_images: project.kitchen_room_images || [],
//         primary_room_images: project.primary_room_images || [],
//         floor_plan_images: project.floor_plan_images || [],
//         tour_3d_images: project.tour_3d_images || [],
//         other_images: project.other_images || [],
//         banner: project.banner,
//         youTube_link: project.youTube_link,
//         youTube_thumbnail: project.youTube_thumbnail,
//         property_type: project.property_type,
//         listing_type: project.listing_type,
//         property_status: project.property_status,
//         property_age: project.property_age,
//         furnishing: project.furnishing,
//         parking_spaces: project.parking_spaces,
//         total_floors: project.total_floors,
//         available_floor: project.available_floor,
//         facing_direction: project.facing_direction,
//         street_width: project.street_width,
//         plot_area: project.plot_area,
//         construction_status: project.construction_status,
//         possession_status: project.possession_status,
//         transaction_type: project.transaction_type,
//         ownership_type: project.ownership_type,
//         expected_pricing: project.expected_pricing,
//         price_per_sqft: project.price_per_sqft,
//         booking_amount: project.booking_amount,
//         maintenance_monthly: project.maintenance_monthly,
//         price_negotiable: project.price_negotiable,
//         available_from: project.available_from,
//         longitude: project.longitude,
//         latitude: project.latitude,
//         distance_between_facility: project.distance_between_facility,
//         country: project.country,
//         region: project.region,
//         city: project.city,
//         views: project.views,
//         isFeatured: project.isFeatured,
//         archive: project.archive,
//         status: project.status,
//         isapproved: project.isapproved,
//         rejectreason: project.rejectreason,
//         createdAt: project.createdAt,
//         agent,
//       };

//       return data;
//     } catch (error) {
//       console.error("[getProjectById] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch project.");
//     }
//   }


 async calculateMortgage(id: string, downPayment: number): Promise<MortgageCalculation> {
    try {
      const project = await this.prisma.property.findUnique({
        where: { id },
      });

      if (!project) {
        throw new InternalServerError("Project not found.");
      }

      const home_price = project.price || 0;
      
      const loan_type = "20-year fixed";
      const loan_term_years = 20;
      const interest_rate = 12;
      const property_tax = 1.5;
      const home_insurance = 0.5;
      const hoa_fees = 0;
      const mortgage_insurance = 0;

      if (isNaN(home_price) || isNaN(downPayment)) {
        throw new InternalServerError("'home_price' and 'down_payment' must be valid numbers.");
      }

      const loan_amount = home_price - downPayment;
      const monthly_interest = interest_rate / 12 / 100;
      const total_payments = loan_term_years * 12;

      const principal_and_interest = parseFloat(
        (
          loan_amount *
          (monthly_interest * Math.pow(1 + monthly_interest, total_payments)) /
          (Math.pow(1 + monthly_interest, total_payments) - 1)
        ).toFixed(2)
      );

      const monthly_property_tax = parseFloat(((property_tax / 100) * home_price / 12).toFixed(2));
      const monthly_home_insurance = parseFloat(((home_insurance / 100) * home_price / 12).toFixed(2));
      const monthly_hoa = parseFloat(hoa_fees.toFixed(2));
      const monthly_mortgage_insurance = parseFloat(((mortgage_insurance / 100) * loan_amount / 12).toFixed(2));

      const total_monthly_payment = parseFloat(
        (
          principal_and_interest +
          monthly_property_tax +
          monthly_home_insurance +
          monthly_hoa +
          monthly_mortgage_insurance
        ).toFixed(2)
      );

      const estimated_closing_cost = parseFloat((0.02 * home_price).toFixed(2));

      return {
        home_location: project.neighborhood,
        home_price,
        down_payment: downPayment,
        loan_amount,
        loan_type,
        interest_rate,
        loan_term_years,
        breakdown: {
          principal_and_interest,
          property_tax: monthly_property_tax,
          home_insurance: monthly_home_insurance,
          hoa: monthly_hoa,
          mortgage_insurance: monthly_mortgage_insurance,
        },
        total_monthly_payment,
        estimated_closing_cost,
      };
    } catch (error) {
      console.error("[calculateMortgage] Error:", error);
      throw new InternalServerError("Failed to calculate mortgage.");
    }
  }
}



