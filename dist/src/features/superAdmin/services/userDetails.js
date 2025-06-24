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
exports.AgentService = void 0;
const prisma_1 = require("../../../lib/prisma");
const date_fns_1 = require("date-fns");
class AgentService {
    getAgentDetail(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const user = yield prisma_1.Prisma.user.findUnique({
                where: { id: userId },
                select: {
                    fullname: true,
                    createdAt: true,
                    phone_number: true,
                    email: true,
                    avatar: true,
                    kyc_status: true,
                    nin_status: true,
                    nin_number: true,
                    nin_slip_url: true,
                    cac_status: true,
                    cac_number: true,
                    cac_doc_url: true,
                    face_status: true,
                    face_image_url: true,
                    kyc_verified_at: true,
                    last_login: true,
                },
            });
            if (!user) {
                throw new Error("Agent not found");
            }
            const totalPropertiesListed = yield prisma_1.Prisma.project.count({
                where: { userId: userId, archive: false },
            });
            const propertiesSold = yield prisma_1.Prisma.project.count({
                where: { userId: userId, archive: false, status: "sold" },
            });
            const propertiesSelling = yield prisma_1.Prisma.project.count({
                where: { userId: userId, archive: false, status: "selling" },
            });
            const projectSelect = {
                outside_view_images: true,
                price: true,
                title: true,
                property_location: true,
                region: true,
                city: true,
                neighborhood: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                square: true,
            };
            const listedProjects = yield prisma_1.Prisma.project.findMany({
                where: { userId: userId, archive: false },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
                select: projectSelect,
            });
            const soldProjects = yield prisma_1.Prisma.project.findMany({
                where: { userId: userId, archive: false, status: "sold" },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
                select: projectSelect,
            });
            const sellingProjects = yield prisma_1.Prisma.project.findMany({
                where: { userId: userId, archive: false, status: "selling" },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
                select: projectSelect,
            });
            const accountCreatedOn = (0, date_fns_1.format)(user.createdAt, "do MMMM yyyy");
            const lastLogin = user.last_login ? (0, date_fns_1.formatDistanceToNow)(user.last_login, { addSuffix: true }) : "Never logged in";
            return {
                agent: {
                    name: user.fullname,
                    accountCreatedOn,
                    phone_number: user.phone_number,
                    email: user.email,
                    avatar: user.avatar,
                    kyc_status: user.kyc_status,
                    lastLogin,
                    kycInformation: {
                        status: user.kyc_status,
                        nin: {
                            status: user.nin_status,
                            number: user.nin_number,
                            slip_url: user.nin_slip_url,
                        },
                        cac: {
                            status: user.cac_status,
                            number: user.cac_number,
                            doc_url: user.cac_doc_url,
                        },
                        face: {
                            status: user.face_status,
                            image_url: user.face_image_url,
                        },
                        verified_at: user.kyc_verified_at,
                    },
                },
                stats: {
                    total: totalPropertiesListed,
                    properties_sold: propertiesSold,
                    properties_selling: propertiesSelling,
                },
                projects: {
                    listed: listedProjects,
                    sold: soldProjects,
                    selling: sellingProjects,
                },
            };
        });
    }
}
exports.AgentService = AgentService;
