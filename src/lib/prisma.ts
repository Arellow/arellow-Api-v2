// import { PrismaClient } from '@prisma/client'

// export const Prisma = new PrismaClient()


// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const Prisma = globalForPrisma.prisma ?? new PrismaClient();

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = Prisma;


// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const Prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = Prisma;
