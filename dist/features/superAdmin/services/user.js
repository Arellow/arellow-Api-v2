"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsersService = async (query) => {
    const { userType, kycStatus, search, suspended, page = "1", limit = "10", } = query;
    const where = {};
    if (userType && Object.values(client_1.UserRole).includes(userType)) {
        where.role = userType;
    }
    if (kycStatus && Object.values(client_1.KycStatus).includes(kycStatus)) {
        // where.kyc_status = kycStatus as KycStatus;
    }
    if (typeof suspended !== 'undefined') {
        where.suspended = suspended === 'true';
    }
    if (search) {
        where.OR = [
            { fullname: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone_number: { contains: search, mode: 'insensitive' } },
        ];
    }
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fullname: true,
                email: true,
                phone_number: true,
                avatar: true,
                role: true,
                last_login: true,
                // kyc_status: true,
            },
        }),
        prisma.user.count({ where }),
    ]);
    return {
        users,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / take),
    };
};
exports.getUsersService = getUsersService;
