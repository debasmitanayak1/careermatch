import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'CareerMatch AI Backend API is running successfully!',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      resumes: '/api/resumes',
      analyses: '/api/analyses',
      matches: '/api/matches',
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
