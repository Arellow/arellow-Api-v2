import { PrismaClient, Prisma } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import {
  PropertyRequest,
  PropertyRequestsResponse,
  PropertyRequestDto,
} from "../dtos/preDto";

const prisma = new PrismaClient();

export class PropertyService {
  private prisma: PrismaClient = prisma;
 
  async getAllPropertyRequests(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PropertyRequestsResponse> {
    try {
      const skip = (page - 1) * limit;

      const requests = await this.prisma.propertyRequest.findMany({
        where: { userId },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      });

      const totalCount = await this.prisma.propertyRequest.count({
        where: { userId },
      });

      return { data: requests, totalCount };
    } catch (error) {
      console.error("[getAllPropertyRequests] Error:", error);
      throw new InternalServerError("Failed to fetch property requests.");
    }
  }

  async getPropertyRequestById(
    id: string,
    userId: string
  ): Promise<PropertyRequest | null> {
    try {
      const request = await this.prisma.propertyRequest.findUnique({
        where: { id, userId },
      });
      return request;
    } catch (error) {
      console.error("[getPropertyRequestById] Error:", error);
      throw new InternalServerError("Failed to fetch property request.");
    }
  }

  async updatePropertyRequest(
    id: string,
    data: Partial<PropertyRequestDto>,
    userId: string
  ): Promise<PropertyRequest> {
    try {
      const updatedRequest = await this.prisma.propertyRequest.update({
        where: { id, userId },
        data: { ...data, updatedAt: new Date() },
      });
      return updatedRequest;
    } catch (error) {
      console.error("[updatePropertyRequest] Error:", error);
      throw new InternalServerError("Failed to update property request.");
    }
  }

  async deletePropertyRequest(id: string, userId: string): Promise<void> {
    try {
      await this.prisma.propertyRequest.delete({
        where: { id, userId },
      });
    } catch (error) {
      console.error("[deletePropertyRequest] Error:", error);
      throw new InternalServerError("Failed to delete property request.");
    }
  }
}
