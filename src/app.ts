import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env';
import cookieParser from 'cookie-parser';
import { ApiResponse } from './utils/ApiResponse';
import { ApiError } from './utils/ApiError';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { asyncHandler } from './utils/asyncHandler';
import router from './routes';

const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }),
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// application routes
app.get(
  '/api/v1/health',
  asyncHandler(async (_req, res: Response) => {
    res.status(200).json(new ApiResponse(200, 'Server is healthy', null));
  }),
);

app.use('/api/v1', router);

// Handle 404 for undefined routes
app.use(
  asyncHandler(async (_req, _res, next) => {
    next(new ApiError(404, 'Route not found'));
  }),
);

// Global error handler
app.use(globalErrorHandler);

export default app;
