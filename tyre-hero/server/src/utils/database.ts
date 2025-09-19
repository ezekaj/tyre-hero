import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Initialize Prisma Client with logging
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Event listeners for Prisma logging
prisma.$on('query', (e) => {
  logger.debug('Database Query', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
    timestamp: e.timestamp,
  });
});

prisma.$on('error', (e) => {
  logger.error('Database Error', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp,
  });
});

prisma.$on('info', (e) => {
  logger.info('Database Info', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp,
  });
});

prisma.$on('warn', (e) => {
  logger.warn('Database Warning', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp,
  });
});

// Database connection function
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database health check passed');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Database disconnection function
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

// Database statistics
export const getDatabaseStats = async () => {
  try {
    const [
      userCount,
      bookingCount,
      serviceCount,
      technicianCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.service.count(),
      prisma.technician.count(),
    ]);

    return {
      users: userCount,
      bookings: bookingCount,
      services: serviceCount,
      technicians: technicianCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
};

// Transaction wrapper with retry logic
export const withTransaction = async <T>(
  fn: (prisma: PrismaClient) => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      lastError = error;
      logger.warn(`Transaction attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  logger.error('Transaction failed after all retries:', lastError);
  throw lastError;
};

// Graceful shutdown handler
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export { prisma };
export default prisma;