'use strict';

const { PrismaClient } = require('../../generated/prisma');

// ─── Prisma client singleton ─────────────────────────────────────────────────
// Enable query logging only in development to avoid flooding production logs.
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
});

/**
 * Attempt a lightweight database operation to verify connectivity.
 * Exits the process with code 1 on failure so the container / PM2 restarts.
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅  Database connected successfully');
  } catch (error) {
    console.error('❌  Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
