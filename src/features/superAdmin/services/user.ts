import { UserRole, KycStatus, Prisma, PrismaClient } from "@prisma/client";
import { UserQueryDTO } from "../dtos/user.dto";
const prisma = new PrismaClient();

export const getUsersService = async (query: UserQueryDTO) => {
  const {
    userType,
    kycStatus,
    search,
    suspended,
    page = "1",
    limit = "10",
  } = query;

  const where: Prisma.UserWhereInput = {};

  if (userType && Object.values(UserRole).includes(userType as UserRole)) {
    where.role = userType as UserRole;
  }

  if (kycStatus && Object.values(KycStatus).includes(kycStatus as KycStatus)) {
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
