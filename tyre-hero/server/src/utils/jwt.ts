import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from './logger.js';

const prisma = new PrismaClient();

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Generate access token
export const generateAccessToken = (payload: Omit<JWTPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'access' },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      issuer: 'tyre-hero-api',
      audience: 'tyre-hero-app',
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate token pair
export const generateTokenPair = async (userId: string, email: string, role: string): Promise<TokenPair> => {
  try {
    const accessToken = generateAccessToken({ userId, email, role });
    const refreshToken = generateRefreshToken();
    
    // Calculate expiration time
    const expiresIn = parseInt(process.env.JWT_ACCESS_EXPIRES_IN?.replace(/\D/g, '') || '15') * 60; // Convert to seconds
    
    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    logger.info('Token pair generated', { userId, email });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  } catch (error) {
    logger.error('Failed to generate token pair:', error);
    throw new ApiError('Failed to generate authentication tokens', 500);
  }
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
    
    if (decoded.type !== 'access') {
      throw new ApiError('Invalid token type', 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError('Invalid token', 401);
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError('Token expired', 401);
    }
    throw error;
  }
};

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair> => {
  try {
    // Find refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!storedToken) {
      throw new ApiError('Invalid refresh token', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new ApiError('Refresh token expired', 401);
    }

    if (!storedToken.user.isActive) {
      throw new ApiError('User account is deactivated', 401);
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new token pair
    const newTokenPair = await generateTokenPair(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role
    );

    logger.info('Access token refreshed', { userId: storedToken.user.id });

    return newTokenPair;
  } catch (error) {
    logger.error('Failed to refresh access token:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to refresh token', 500);
  }
};

// Revoke refresh token (logout)
export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    if (result.count === 0) {
      logger.warn('Attempted to revoke non-existent refresh token');
    } else {
      logger.info('Refresh token revoked');
    }
  } catch (error) {
    logger.error('Failed to revoke refresh token:', error);
    throw new ApiError('Failed to revoke token', 500);
  }
};

// Revoke all refresh tokens for a user (logout from all devices)
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info('All user tokens revoked', { userId, count: result.count });
  } catch (error) {
    logger.error('Failed to revoke all user tokens:', error);
    throw new ApiError('Failed to revoke tokens', 500);
  }
};

// Clean up expired refresh tokens (should be run periodically)
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info('Expired tokens cleaned up', { count: result.count });
  } catch (error) {
    logger.error('Failed to clean up expired tokens:', error);
  }
};

// Validate token format
export const isValidTokenFormat = (token: string): boolean => {
  return /^[A-Za-z0-9+/=]+$/.test(token) && token.length >= 64;
};

// Get token expiry time
export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};