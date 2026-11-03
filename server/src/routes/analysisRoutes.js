import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { validateUuid } from '../utils/validators.js';
import { HttpError } from '../utils/errors.js';

const router = Router();

// All analysis routes require authentication
router.use(requireAuth);

/**
 * GET /api/analyses — List all analyses for current user
 */
router.get('/', async (req, res, next) => {
  try {
    const analysesRes = await query(
      `SELECT 
        a.id, 
        a.resume_id, 
        a.result, 
        a.created_at, 
        json_build_object('id', r.id, 'file_name', r.file_name, 'file_size', r.file_size) as resumes
       FROM analyses a
       LEFT JOIN resumes r ON a.resume_id = r.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.userId]
    );

    res.json(analysesRes.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analyses/latest — Fetch the most recent analysis
 * NOTE: Defined before /:id route
 */
router.get('/latest', async (req, res, next) => {
  try {
    const analysisRes = await query(
      `SELECT 
        a.id, 
        a.resume_id, 
        a.result, 
        a.created_at, 
        json_build_object('id', r.id, 'file_name', r.file_name, 'file_size', r.file_size) as resumes
       FROM analyses a
       LEFT JOIN resumes r ON a.resume_id = r.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [req.userId]
    );

    if (analysisRes.rows.length === 0) {
      return res.status(200).json(null);
    }

    res.json(analysisRes.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analyses/:id — Fetch a specific analysis by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUuid(id, 'analysis ID');

    const analysisRes = await query(
      `SELECT 
        a.id, 
        a.resume_id, 
        a.result, 
        a.created_at, 
        json_build_object('id', r.id, 'file_name', r.file_name, 'file_size', r.file_size) as resumes
       FROM analyses a
       LEFT JOIN resumes r ON a.resume_id = r.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, req.userId]
    );

    if (analysisRes.rows.length === 0) {
      throw new HttpError(404, 'Analysis not found.');
    }

    res.json(analysisRes.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/analyses/:id — Remove analysis and associated resume
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUuid(id, 'analysis ID');

    // Retrieve analysis to get resume_id
    const analysisRes = await query(
      'SELECT id, resume_id FROM analyses WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (analysisRes.rows.length === 0) {
      throw new HttpError(404, 'Analysis not found.');
    }

    const { resume_id } = analysisRes.rows[0];

    // Deleting the resume automatically cascades to analyses and job_matches
    if (resume_id) {
      await query('DELETE FROM resumes WHERE id = $1 AND user_id = $2', [resume_id, req.userId]);
    } else {
      await query('DELETE FROM analyses WHERE id = $1 AND user_id = $2', [id, req.userId]);
    }

    res.json({ message: 'Analysis and resume successfully removed.' });
  } catch (err) {
    next(err);
  }
});

export default router;
