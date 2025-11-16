import { PrismaClient } from '@prisma/client';

// PrismaClient 싱글턴
const globalForPrisma = globalThis;

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ['error', 'warn'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}


