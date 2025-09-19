import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from './logger.js';
import prisma from './database.js';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate JWT secrets exist
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets not configured. Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET');
}

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS!) || 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate access token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    issuer: 'tyre-hero-api',
    audience: 'tyre-hero-client',
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'tyre-hero-api',
    audience: 'tyre-hero-client',
  });
};

/**
 * Generate token pair (access + refresh)
 */
export const generateTokenPair = async (
  userId: string,
  email: string,
  role: string
): Promise<TokenPair> => {
  const payload = { userId, email, role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  await storeRefreshToken(userId, refreshToken);

  logger.info('Token pair generated', { userId, email });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'tyre-hero-api',
      audience: 'tyre-hero-client',
    }) as JWTPayload;
  } catch (error) {
    logger.warn('Access token verification failed', { error: (error as Error).message });
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'tyre-hero-api',
      audience: 'tyre-hero-client',
    }) as JWTPayload;
  } catch (error) {
    logger.warn('Refresh token verification failed', { error: (error as Error).message });
    throw new Error('Invalid refresh token');
  }
};

/**
 * Store refresh token in database
 */
export const storeRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

/**
 * Remove refresh token from database
 */
export const removeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Check if refresh token exists and is valid
 */
export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) {
    return false;
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    // Remove expired token
    await removeRefreshToken(token);
    return false;
  }

  return true;
};

/**
 * Refresh token pair
 */
export const refreshTokenPair = async (refreshToken: string): Promise<TokenPair> => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Check if refresh token exists in database
  const isValid = await isRefreshTokenValid(refreshToken);
  if (!isValid) {
    throw new Error('Refresh token not found or expired');
  }

  // Remove old refresh token
  await removeRefreshToken(refreshToken);

  // Generate new token pair
  return generateTokenPair(decoded.userId, decoded.email, decoded.role);
};

/**
 * Revoke all user tokens
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  logger.info('All tokens revoked for user', { userId });
};

/**
 * Generate random token for email verification, password reset, etc.
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate secure random password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Password strength validation
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 2;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }

  // No common patterns
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
  const hasCommonPattern = commonPatterns.some(pattern =>
    password.toLowerCase().includes(pattern)
  );

  if (hasCommonPattern) {
    score -= 2;
    feedback.push('Password contains common patterns that are easy to guess');
  }

  return {
    isValid: score >= 4 && feedback.length === 0,
    score: Math.max(0, Math.min(5, score)),
    feedback,
  };
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Generate API key for external integrations
 */
export const generateApiKey = (): string => {
  const prefix = 'th_'; // tyre-hero prefix
  const randomPart = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomPart}`;
};

/**
 * Create email verification token
 */
export const createEmailVerificationToken = async (userId: string): Promise<string> => {
  const token = generateRandomToken();

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerificationToken: token },
  });

  logger.info('Email verification token created', { userId });
  return token;
};

/**
 * Create password reset token
 */
export const createPasswordResetToken = async (userId: string): Promise<string> => {
  const token = generateRandomToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    },
  });

  logger.info('Password reset token created', { userId });
  return token;
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = async (token: string): Promise<string | null> => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  return user?.id || null;
};