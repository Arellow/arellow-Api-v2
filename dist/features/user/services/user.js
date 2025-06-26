"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
const prisma = new client_1.PrismaClient();
class UserService {
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    properties: true,
                    rewardHistory: {
                        where: { reason: { contains: "sold", mode: "insensitive" } },
                    },
                },
            });
            if (!user) {
                throw new appError_1.NotFoundError("User not found.");
            }
            // Calculate properties listed
            const propertiesListed = user.properties.length;
            // Calculate properties sold (based on rewardHistory length for sold transactions)
            const propertiesSold = user.rewardHistory.length;
            // Calculate selling (sum of points from sold transactions)
            const selling = user.rewardHistory.reduce((sum, entry) => sum + (entry.points || 0), 0);
            return this.mapToResponse({ ...user, propertiesListed, propertiesSold, selling });
        }
        catch (error) {
            console.error("[getUserById] Prisma error:", error);
            throw new appError_1.InternalServerError("Database error when fetching user.");
        }
    }
    async updateUser(userId, data) {
        try {
            const updatedData = {};
            if (data.fullname !== undefined)
                updatedData.fullname = data.fullname;
            if (data.username !== undefined)
                updatedData.username = data.username;
            if (data.phone_number !== undefined)
                updatedData.phone_number = data.phone_number;
            if (data.avatar !== undefined)
                updatedData.avatar = data.avatar;
            const user = await prisma.user.update({
                where: { id: userId },
                data: updatedData,
            });
            return this.mapToResponse(user);
        }
        catch (error) {
            console.error("[updateUser] Prisma error:", error);
            throw new appError_1.InternalServerError("Database error when updating user.");
        }
    }
    async deleteUser(userId) {
        try {
            await prisma.user.delete({
                where: { id: userId },
            });
        }
        catch (error) {
            console.error("[deleteUser] Prisma error:", error);
            throw new appError_1.InternalServerError("Database error when deleting user.");
        }
    }
    async suspendUser(userId, data) {
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    suspended: true,
                },
            });
            if (!user) {
                throw new appError_1.NotFoundError("User not found.");
            }
            const mailOptions = await (0, mailer_1.suspendedAccountMailOption)(user.email, data?.reason);
            await (0, nodemailer_1.nodeMailerController)(mailOptions);
            return this.mapToResponse(user);
        }
        catch (error) {
            console.error("[suspendUser] Prisma error:", error);
            throw new appError_1.InternalServerError("Database error when suspending user.");
        }
    }
    async updateUserRole(userId, data) {
        try {
            const user = await prisma.user.update({
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
    }
    mapToResponse(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullname: user.fullname,
            avatar: user.avatar,
            phone_number: user.phone_number,
            role: user.role,
            is_verified: user.is_verified,
            suspended: user.suspended,
            points: user.points || 0,
            last_login: user.last_login || null,
            createdAt: user.createdAt,
            propertiesListed: user.propertiesListed || 0,
            propertiesSold: user.propertiesSold || 0,
            selling: user.selling || 0,
        };
    }
}
exports.UserService = UserService;
