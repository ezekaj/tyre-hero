import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { ApiError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Access token is required', 401);
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new ApiError('Access token is required', 401);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new ApiError('User not found', 401);
    }

    if (!user.isActive) {
      throw new ApiError('Account is deactivated', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new ApiError('Authentication required', 401));
  }

  // For now, we'll skip email verification check in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // In production, implement email verification check
  // This would require adding isEmailVerified to the user selection in authMiddleware
  next();
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    logger.warn('Optional auth failed:', error instanceof Error ? error.message : 'Unknown error');
    next();
  }
};