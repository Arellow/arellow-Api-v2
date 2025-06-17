import { InternalServerError } from "../../../lib/appError";
import { Prisma ,PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class RequestPropertyService{
    private prisma: PrismaClient = prisma;
 async createPropertyRequest(
    name: string,
    email: string,
    phone_number: string,
    property_category: string,
    property_type: string,
    furnishing_status: string,
    country: string,
    state: string,
    number_of_bedrooms?: number,
    number_of_bathrooms?: number,
    budget?: number,
    property_description?: string | null,
    userId?: string | null
  ): Promise<{ id: string }> {
    try {
      const data: Prisma.PropertyRequestUncheckedCreateInput = {
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

      const propertyRequest = await this.prisma.propertyRequest.create({
        data,
      });

      return { id: propertyRequest.id };
    } catch (error) {
      console.error("[createPropertyRequest] Error:", error);
      throw new InternalServerError("Failed to create property request.");
    }
  }
}


