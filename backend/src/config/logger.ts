import { createLogger, format, transports } from 'winston';
import path from 'path';

const logDirectory = path.join(__dirname, '../logs');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`,
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(logDirectory, 'combined.log'),
    }),
  ],
});

export default logger;
