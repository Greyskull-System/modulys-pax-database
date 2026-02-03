import { PrismaClient } from '@prisma/client';

// Singleton pattern para evitar múltiplas conexões
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export PrismaClient para uso externo
export { PrismaClient };

// Re-export todos os tipos gerados pelo Prisma
export * from '@prisma/client';
