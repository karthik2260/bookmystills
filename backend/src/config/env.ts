import dotenv from 'dotenv';
dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const requireEnvInt = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid integer, got: "${value}"`);
  }
  return parsed;
};

export const ENV = {
  // Server
  PORT: requireEnvInt('PORT', 3000),
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test', // ✅ safe fallback

  // Database
  MONGO_URI: requireEnv('MONGO_URI'),

  // Email
  USER_EMAIL: requireEnv('USER_EMAIL'),
  USER_PASSWORD: requireEnv('USER_PASSWORD'),

  // Session
  SESSION_SECRET: requireEnv('SESSION_SECRET'),

  // URLs
  BACKEND_URL: requireEnv('BACKEND_URL'),
  FRONTEND_URL: requireEnv('FRONTEND_URL'),

  // JWT
  JWT_SECRET_KEY: requireEnv('JWT_SECRET_KEY'),
  JWT_REFRESH_SECRET_KEY: requireEnv('JWT_REFRESH_SECRET_KEY'),
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',

  // AWS
  ACCESS_KEY: requireEnv('ACCESS_KEY'),
  SECRET_ACCESS_KEY: requireEnv('SECRET_ACCESS_KEY'),
  BUCKET_REGION: requireEnv('BUCKET_REGION'),
  BUCKET_NAME: requireEnv('BUCKET_NAME'),

  // Google OAuth
  CLIENT_SECRET: requireEnv('CLIENT_SECRET'),

  // Timeouts
  COOKIE_MAX_AGE: requireEnvInt('COOKIE_MAX_AGE', 604800000),
  OTP_EXPIRY_TIME: requireEnvInt('OTP_EXPIRY_TIME', 300000),
  RESEND_COOLDOWN: requireEnvInt('RESEND_COOLDOWN', 60000),
  CORS_MAX_AGE: requireEnvInt('CORS_MAX_AGE', 86400),
  TOKEN_EXPIRY_THRESHOLD: requireEnvInt('TOKEN_EXPIRY_THRESHOLD', 300000),

  ADMIN_COOKIE_NAME: process.env.ADMIN_COOKIE_NAME || 'jwtTokenAdmin',
} as const;

export type EnvConfig = typeof ENV;
