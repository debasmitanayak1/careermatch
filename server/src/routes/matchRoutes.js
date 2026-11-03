import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { matchResumeWithJob } from '../services/geminiService.js';
import { validateUuid, validateJobMatchInput } from '../utils/validators.js';
import { HttpError } from '../utils/errors.js';

const router = Router();

// All match routes require authentication
router.use(requireAuth);

/**
 * GET /api/matches — List all job matches for the current user
 */
router.get('/', async (req, res, next) => {
  try {
    const matchesRes = await query(
      `SELECT 
        j.id, 
        j.resume_id, 
        j.job_title, 
        j.job_description, 
        j.result, 
        j.created_at, 
        json_build_object('id', r.id, 'file_name', r.file_name) as resumes
       FROM job_matches j
       LEFT JOIN resumes r ON j.resume_id = r.id
       WHERE j.user_id = $1
       ORDER BY j.created_at DESC`,
      [req.userId]
    );

    res.json(matchesRes.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/matches — Match a candidate's resume to a job description
 */
router.post('/', async (req, res, next) => {
  try {
    const { resumeId, jobTitle, jobDescription } = req.body;

    validateUuid(resumeId, 'resume ID');
    validateJobMatchInput(jobTitle, jobDescription);

    // Fetch the candidate's resume
    const resumeRes = await query(
      'SELECT id, file_name, extracted_text FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, req.userId]
    );

    if (resumeRes.rows.length === 0) {
      throw new HttpError(404, 'Selected resume not found.');
    }

    const resume = resumeRes.rows[0];

    if (!resume.extracted_text) {
      throw new HttpError(400, 'Resume does not contain extracted text.');
    }

    // Call Gemini AI for match scoring and gap analysis
    const matchResult = await matchResumeWithJob(
      resume.extracted_text,
      jobTitle,
      jobDescription
    );

    // Store in job_matches table in Neon DB
    const insertRes = await query(
      `INSERT INTO job_matches (user_id, resume_id, job_title, job_description, result)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, resume_id, job_title, job_description, result, created_at`,
      [
        req.userId,
        resume.id,
        jobTitle ? jobTitle.trim() : 'Target Job Position',
        jobDescription.trim(),
        JSON.stringify(matchResult),
      ]
    );

    const matchRecord = insertRes.rows[0];
    matchRecord.resumes = { id: resume.id, file_name: resume.file_name };

    res.status(201).json(matchRecord);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/matches/:id — Delete a specific job match
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    validateUuid(id, 'match ID');

    const deleteRes = await query(
      'DELETE FROM job_matches WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (deleteRes.rows.length === 0) {
      throw new HttpError(404, 'Job match not found.');
    }

    res.json({ message: 'Job match deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
