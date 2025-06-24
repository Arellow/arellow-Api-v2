import { InternalServerError } from "../../../lib/appError";
// import { Prisma ,PrismaClient, PropertyRequest } from "@prisma/client";
import { PropertyRequestsResponse } from "../dtos/request.dto";
// const prisma = new PrismaClient();
// export class RequestPropertyService{
//     private prisma: PrismaClient = prisma;
//  async createPropertyRequest(
//     name: string,
//     email: string,
//     phone_number: string,
//     property_category: string,
//     property_type: string,
//     furnishing_status: string,
//     country: string,
//     state: string,
//     number_of_bedrooms?: number,
//     number_of_bathrooms?: number,
//     budget?: number,
//     property_description?: string | null,
//     userId?: string | null
//   ): Promise<{ id: string }> {
//     try {
//       const data: Prisma.PropertyRequestUncheckedCreateInput = {
//         name,
//         email,
//         phone_number,
//         property_category,
//         property_type,
//         furnishing_status,
//         country,
//         state,
//         number_of_bedrooms,
//         number_of_bathrooms,
//         budget,
//         property_description,
//         userId,
//         property_location: `${country}, ${state}`,
//         neighborhood: "N/A"
//       };

//       const propertyRequest = await this.prisma.propertyRequest.create({
//         data,
//       });

//       return { id: propertyRequest.id };
//     } catch (error) {
//       console.error("[createPropertyRequest] Error:", error);
//       throw new InternalServerError("Failed to create property request.");
//     }
//   }
// // async getAllPropertyRequests(userId: string): Promise<PropertyRequestsResponse> {
// //     try {
// //       const propertyRequests = await this.prisma.propertyRequest.findMany({
// //         where: { userId },
// //         orderBy: { createdAt: "desc" },
// //         select: {
// //           id: true,
// //           name: true,
// //           email: true,
// //           phone_number: true,
// //           property_category: true,
// //           property_type: true,
// //           furnishing_status: true,
// //           country: true,
// //           number_of_bedrooms: true,
// //           number_of_bathrooms: true,
// //           budget: true,
// //           property_description: true,
// //           userId: true,
// //           property_location: true,
// //           neighborhood: true,
// //           createdAt: true,
// //           updatedAt: true,
// //         },
// //       });
// //       const totalCount = await this.prisma.propertyRequest.count({
// //         where: { userId },
// //       });

// //       // Type assertion to match PropertyRequest interface
// //       const typedRequests: PropertyRequest[] = propertyRequests.map((req) => ({
// //         ...req,
// //         category: req.property_category, 
// //         type: req.property_type, 
// //         furnishingStatus: req.furnishing_status, 
// //         additionalNote: req.property_description, 
// //         phone: req.phone_number, 
// //       }));

// //       return { data: typedRequests, totalCount };
// //     } catch (error) {
// //       console.error("[getAllPropertyRequests] Error:", error);
// //       throw new InternalServerError("Failed to fetch property requests.");
// //     }
// //   }

//   // async getPropertyRequestById(id: string, userId: string): Promise<PropertyRequest | null> {
//   //   try {
//   //     const propertyRequest = await this.prisma.propertyRequest.findFirst({
//   //       where: { id, userId },
//   //       select: {
//   //         id: true,
//   //         name: true,
//   //         email: true,
//   //         phone_number: true,
//   //         property_category: true,
//   //         property_type: true,
//   //         furnishing_status: true,
//   //         country: true,
//   //         number_of_bedrooms: true,
//   //         number_of_bathrooms: true,
//   //         budget: true,
//   //         property_description: true,
//   //         userId: true,
//   //         property_location: true,
//   //         neighborhood: true,
//   //         createdAt: true,
//   //         updatedAt: true,
//   //       },
//   //     });

//   //     if (!propertyRequest) return null;

//   //     // Type assertion to match PropertyRequest interface
//   //     const typedRequest: PropertyRequest = {
//   //       ...propertyRequest,
//   //       category: propertyRequest.property_category,
//   //       type: propertyRequest.property_type,
//   //       furnishingStatus: propertyRequest.furnishing_status,
//   //       additionalNote: propertyRequest.property_description,
//   //       phone: propertyRequest.phone_number,
//   //     };

//   //     return typedRequest;
//   //   } catch (error) {
//   //     console.error("[getPropertyRequestById] Error:", error);
//   //     throw new InternalServerError("Failed to fetch property request.");
//   //   }
//   // }
// }