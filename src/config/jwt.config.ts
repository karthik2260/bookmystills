import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthRole } from '../enums/commonEnums';
import logger from './logger';
import { StringValue } from 'ms';

// Token Creation

export const createAccessToken = (id: string, role: AuthRole): string => {
  const options: SignOptions = { expiresIn: ENV.ACCESS_TOKEN_EXPIRES as StringValue };
  return jwt.sign({ _id: id, role }, ENV.JWT_SECRET_KEY, options);
};

export const createRefreshToken = (id: string): string => {
  const options: SignOptions = { expiresIn: ENV.REFRESH_TOKEN_EXPIRES as StringValue };
  return jwt.sign({ _id: id }, ENV.JWT_REFRESH_SECRET_KEY, options);
};
// Token Verification

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET_KEY) as JwtPayload;
  } catch (err) {
    logger.warn(`Access token verification failed: ${err}`);
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET_KEY) as JwtPayload;
  } catch (err) {
    logger.warn(`Refresh token verification failed: ${err}`);
    return null;
  }
};

// Token Utilities

export const isTokenExpiringSoon = (
  token: string,
  thresholdMs: number = ENV.TOKEN_EXPIRY_THRESHOLD,
): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return true;
    const timeUntilExpiration = decoded.exp * 1000 - Date.now();
    return timeUntilExpiration < thresholdMs;
  } catch (error) {
    logger.error(`Token expiry check failed: ${error}`);
    return true;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch {
    return null;
  }
};
