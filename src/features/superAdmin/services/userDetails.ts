import { Prisma } from "../../../lib/prisma";
import { format, formatDistanceToNow } from "date-fns";

export class AgentService {
  // async getAgentDetail(userId: string, page: number, limit: number) {
  //   const skip = (page - 1) * limit;

  //   const user = await Prisma.user.findUnique({
  //     where: { id: userId },
  //     select: {
  //       fullname: true,
  //       createdAt: true,
  //       phone_number: true,
  //       email: true,
  //       avatar:true,
  //       kyc_status: true,
  //       nin_status: true,
  //       nin_number: true,
  //       nin_slip_url: true,
  //       cac_status: true,
  //       cac_number: true,
  //       cac_doc_url: true,
  //       face_status: true,
  //       face_image_url: true,
  //       kyc_verified_at: true,
  //       last_login: true,
  //     },
  //   });

  //   if (!user) {
  //     throw new Error("Agent not found");
  //   }

  //   const totalPropertiesListed = await Prisma.project.count({
  //     where: { userId: userId, archive: false },
  //   });

  //   const propertiesSold = await Prisma.project.count({
  //     where: { userId: userId, archive: false, status: "sold" },
  //   });

  //   const propertiesSelling = await Prisma.project.count({
  //     where: { userId: userId, archive: false, status: "selling" },
  //   });

  //   const projectSelect = {
  //     outside_view_images: true,
  //     price: true,
  //     title: true,
  //     property_location: true,
  //     region: true,
  //     city: true,
  //     neighborhood: true,
  //     number_of_bathrooms: true,
  //     number_of_bedrooms: true,
  //     square: true,
  //   };

  //   const listedProjects = await Prisma.project.findMany({
  //     where: { userId: userId, archive: false },
  //     orderBy: { createdAt: "desc" },
  //     take: limit,
  //     skip: skip,
  //     select: projectSelect,
  //   });

  //   const soldProjects = await Prisma.project.findMany({
  //     where: { userId: userId, archive: false, status: "sold" },
  //     orderBy: { createdAt: "desc" },
  //     take: limit,
  //     skip: skip,
  //     select: projectSelect,
  //   });

  //   const sellingProjects = await Prisma.project.findMany({
  //     where: { userId: userId, archive: false, status: "selling" },
  //     orderBy: { createdAt: "desc" },
  //     take: limit,
  //     skip: skip,
  //     select: projectSelect,
  //   });

  //   const accountCreatedOn = format(user.createdAt, "do MMMM yyyy");
  //   const lastLogin = user.last_login ? formatDistanceToNow(user.last_login, { addSuffix: true }) : "Never logged in";

  //   return {
  //     agent: {
  //       name: user.fullname,
  //       accountCreatedOn,
  //       phone_number: user.phone_number,
  //       email: user.email,
  //       avatar:user.avatar,
  //       kyc_status: user.kyc_status,
  //       lastLogin,
  //       kycInformation: {
  //         status: user.kyc_status,
  //         nin: {
  //           status: user.nin_status,
  //           number: user.nin_number,
  //           slip_url: user.nin_slip_url,
  //         },
  //         cac: {
  //           status: user.cac_status,
  //           number: user.cac_number,
  //           doc_url: user.cac_doc_url,
  //         },
  //         face: {
  //           status: user.face_status,
  //           image_url: user.face_image_url,
  //         },
  //         verified_at: user.kyc_verified_at,
  //       },
  //     },
  //     stats: {
  //       total: totalPropertiesListed,
  //       properties_sold: propertiesSold,
  //       properties_selling: propertiesSelling,
  //     },
  //     projects: {
  //       listed: listedProjects,
  //       sold: soldProjects,
  //       selling: sellingProjects,
  //     },
  //   };
  // }
}
