import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { HttpError } from './utils/errors.js';

dotenv.config();

const app = express();

// Trust proxy for reverse proxies / Render / Vercel
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet());

// CORS configuration (allow requests from any client origin or configured CLIENT_URL)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Health Check at both /api/health and /health and /
app.use('/api', healthRoutes);
app.use('/', healthRoutes);

// Mount API feature routes with and without /api prefix
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/resumes', resumeRoutes);
app.use('/resumes', resumeRoutes);

app.use('/api/analyses', analysisRoutes);
app.use('/analyses', analysisRoutes);

app.use('/api/matches', matchRoutes);
app.use('/matches', matchRoutes);

// 404 handler for unmapped routes
app.use((req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found.`));
});

// Central error handler
app.use(errorHandler);

export default app;
