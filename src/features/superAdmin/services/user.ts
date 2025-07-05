import { UserRole, KycStatus, Prisma, PrismaClient } from '@prisma/client';
import { UserQueryDTO } from '../dtos/user.dto';

const prisma = new PrismaClient();

export const getUsersService = async (query: UserQueryDTO) => {
  const {
    userType,
    kycStatus,
    search,
    suspended,
    page = '1',
    limit = '10',
  } = query;

  const where: Prisma.UserWhereInput = {};

  // Normalize userType to uppercase and validate against UserRole enum
  const normalizedUserType = userType ? userType.toUpperCase() : undefined;
  if (normalizedUserType && Object.values(UserRole).includes(normalizedUserType as UserRole)) {
    where.role = normalizedUserType as UserRole;
  } else if (userType) {
    console.warn(`Invalid userType: ${userType}. Expected one of ${Object.values(UserRole).join(', ')}`);
  }

  // // Validate kycStatus against KycStatus enum
  // if (kycStatus && Object.values(KycStatus).includes(kycStatus as KycStatus)) {
  //   where.kyc_status = kycStatus as KycStatus;
  // } else if (kycStatus) {
  //   console.warn(`Invalid kycStatus: ${kycStatus}. Expected one of ${Object.values(KycStatus).join(', ')}`);
  // }

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
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone_number: true,
        avatar: true,
        role: true,
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