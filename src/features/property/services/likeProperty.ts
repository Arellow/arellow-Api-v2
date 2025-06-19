import { PrismaClient, Prisma } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import { LikeResponse, Project, UserLikedPropertiesResponse, ProjectLikedUsersResponse, User } from "../dtos/likeProperty.dto";

const prisma = new PrismaClient();

export class PropertyService {
  private prisma: PrismaClient = prisma;

  async toggleProjectLike(projectId: string, userId: string): Promise<LikeResponse> {
    try {
      const projectExists = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!projectExists) {
        throw new Error("Project not found");
      }

      const existingLike = await this.prisma.likeUser.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });

      if (existingLike) {
        await this.prisma.likeUser.delete({
          where: { id: existingLike.id },
        });
        const likeCount = await this.prisma.likeUser.count({
          where: { projectId },
        });
        return { projectId, isLiked: false, likeCount };
      } else {
        await this.prisma.likeUser.create({
          data: { userId, projectId },
        });
        const likeCount = await this.prisma.likeUser.count({
          where: { projectId },
        });
        return { projectId, isLiked: true, likeCount };
      }
    } catch (error) {
      console.error("[toggleProjectLike] Error:", error);
      throw new InternalServerError("Failed to toggle project like.");
    }
  }

//   async getUserLikedProperties(userId: string): Promise<UserLikedPropertiesResponse> {
//     try {
//       const likedItems = await this.prisma.likeUser.findMany({
//         where: { userId },
//         include: {
//           Project: {
//             include: {
//               likes: true,
//               user: {
//                 select: {
//                   id: true,
//                   username: true,
//                   fullname: true,
//                   avatar: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//       const formatted = likedItems
//         .filter((item) => item.Project)
//         .map((item) => {
//           const { likes, ...projectData } = item.Project;
//           return {
//             ...projectData,
//             likeCount: likes.length, 
//             isLiked: true,
//           };
//         });

//       return { data: formatted };
//     } catch (error) {
//       console.error("[getUserLikedProperties] Error:", error);
//       throw new InternalServerError("Failed to fetch user liked properties.");
//     }
//   }

//   async getProjectLikedUsers(projectId: string): Promise<ProjectLikedUsersResponse> {
//     try {
//       const likes = await this.prisma.likeUser.findMany({
//         where: { projectId },
//         include: {
//           User: {
//             select: {
//               id: true,
//               username: true,
//               fullname: true,
//               email: true,
//               avatar: true,
//               phone_number: true,
//               rating: true,
//             },
//           },
//         },
//       });

//       const users: User[] = likes.map((like) => like.User);

//       return { totalUsers: users.length, users };
//     } catch (error) {
//       console.error("[getProjectLikedUsers] Error:", error);
//       throw new InternalServerError("Failed to fetch project liked users.");
//     }
//   }
}