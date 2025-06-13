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
exports.UserService = void 0;
const appError_1 = require("../../../lib/appError");
const prisma_1 = require("../../../lib/prisma");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
class UserService {
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.Prisma.user.findUnique({
                    where: { id: userId },
                    include: {
                        projects: true,
                        rewardHistory: {
                            where: { reason: { contains: "sold", mode: "insensitive" } },
                        },
                    },
                });
                if (!user) {
                    throw new appError_1.NotFoundError("User not found.");
                }
                // Calculate properties listed
                const propertiesListed = user.projects.length;
                // Calculate properties sold (assuming each sold entry in rewardHistory corresponds to a property sold)
                const propertiesSold = user.rewardHistory.length;
                // Calculate selling (sum of points from sold transactions)
                const selling = user.rewardHistory.reduce((sum, entry) => sum + (entry.points || 0), 0);
                return this.mapToResponse(Object.assign(Object.assign({}, user), { propertiesListed, propertiesSold, selling }));
            }
            catch (error) {
                console.error("[getUserById] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when fetching user.");
            }
        });
    }
    updateUser(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedData = {};
                if (data.fullname !== undefined)
                    updatedData.fullname = data.fullname;
                if (data.username !== undefined)
                    updatedData.username = data.username;
                if (data.phone_number !== undefined)
                    updatedData.phone_number = data.phone_number;
                // if (data.avatar !== undefined) updatedData.avatar = data.avatar;
                const user = yield prisma_1.Prisma.user.update({
                    where: { id: userId },
                    data: updatedData,
                });
                return this.mapToResponse(user);
            }
            catch (error) {
                console.error("[updateUser] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when updating user.");
            }
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.Prisma.user.delete({
                    where: { id: userId },
                });
            }
            catch (error) {
                console.error("[deleteUser] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when deleting user.");
            }
        });
    }
    suspendUser(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.Prisma.user.update({
                    where: { id: userId },
                    data: {
                        suspended: true,
                    },
                });
                if (!user) {
                    throw new appError_1.NotFoundError("User not found.");
                }
                const mailOptions = yield (0, mailer_1.suspendedAccountMailOption)(user.email, data === null || data === void 0 ? void 0 : data.reason);
                yield (0, nodemailer_1.nodeMailerController)(mailOptions);
                return this.mapToResponse(user);
            }
            catch (error) {
                console.error("[suspendUser] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when suspending user.");
            }
        });
    }
    updateUserRole(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validRoles = ["admin", "superadmin", "buyer", "agent", "realtor"];
                if (!validRoles.includes(data.role)) {
                    throw new appError_1.InternalServerError("Invalid role. Must be one of: admin, superAdmin, buyer, agent, realtor.");
                }
                const user = yield prisma_1.Prisma.user.update({
                    where: { id: userId },
                    data: {
                        role: data.role,
                    },
                });
                return this.mapToResponse(user);
            }
            catch (error) {
                console.error("[updateUserRole] Prisma error:", error);
                throw new appError_1.InternalServerError("Database error when updating user role.");
            }
        });
    }
    mapToResponse(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullname: user.fullname,
            avatar: user.avatar,
            banner: user.banner,
            phone_number: user.phone_number,
            gender: user.gender,
            city: user.city,
            country: user.country,
            biography: user.biography,
            rating: user.rating,
            is_verified: user.is_verified,
            role: user.role,
            createdAt: user.createdAt,
            kyc_status: user.kyc_status,
            nin_status: user.nin_status,
            nin_number: user.nin_number,
            nin_slip_url: user.nin_slip_url,
            cac_status: user.cac_status,
            cac_number: user.cac_number,
            cac_doc_url: user.cac_doc_url,
            badge: user.badge,
            face_status: user.face_status,
            face_image_url: user.face_image_url,
            kyc_verified_at: user.kyc_verified_at,
            points: user.points,
            last_login: user.last_login,
            suspended: user.suspended,
            twoFactorEnabled: user.twoFactorEnabled || false,
            propertiesListed: user.propertiesListed || 0,
            propertiesSold: user.propertiesSold || 0,
            selling: user.selling || 0,
        };
    }
}
exports.UserService = UserService;
