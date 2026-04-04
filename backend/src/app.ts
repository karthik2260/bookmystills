import express from 'express';
import { createServer } from 'http';
import { connectDB } from './config/connectDatabase';
import session from 'express-session';
import cors from 'cors';
import { corsOption } from './config/corsConfig';
import path from 'path';
import { sessionOptions } from './config/session.config';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import vendorRoutes from './routes/vendorRoutes';
import adminRoutes from './routes/adminRoutes';
import morgan from 'morgan';
import helmet from 'helmet';
import logger from './config/logger';
import { accessLogStream, errorLogStream } from './config/loggerConfig';
import { ENV } from './config/env';

export const app = express();
const server = createServer(app);

app.use(morgan('dev', { stream: accessLogStream }));

app.use(
  morgan('combined', {
    stream: errorLogStream,
    skip: (_, res) => res.statusCode < 400,
  }),
);

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }),
);

app.use(helmet());
app.use(cors(corsOption));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
app.use(express.static(path.join(__dirname, 'build')));

app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

connectDB()
  .then(() => {
    server.listen(ENV.PORT, () => {
      logger.info(`Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err}`);
    process.exit(1);
  });
