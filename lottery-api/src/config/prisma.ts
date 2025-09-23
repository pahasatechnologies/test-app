import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to database via Prisma');
  })
  .catch((error) => {
    console.error('❌ Prisma connection error:', error);
    process.exit(1);
  });

export default prisma;
