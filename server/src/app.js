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

// Trust proxy for reverse proxies / Vercel
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new HttpError(403, 'CORS origin not allowed by policy.'));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Mount Health Check at both /api/health and /health
app.use('/api', healthRoutes);
app.use('/', healthRoutes);

// Mount API feature routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/matches', matchRoutes);

// 404 handler for unmapped routes
app.use((req, res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found.`));
});

// Central error handler
app.use(errorHandler);

export default app;
