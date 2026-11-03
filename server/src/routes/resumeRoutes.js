import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { resumeUploadMiddleware } from '../middleware/upload.js';
import { extractTextFromPdf } from '../services/pdfService.js';
import { analyzeResumeWithGemini } from '../services/geminiService.js';
import { query } from '../config/db.js';

const router = Router();

// All resume routes require authentication
router.use(requireAuth);

/**
 * GET /api/resumes — Fetch all resumes belonging to the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const resumesRes = await query(
      'SELECT id, file_name, file_size, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json(resumesRes.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resumes/upload — Upload, parse, analyze, and save resume in Neon DB
 */
router.post('/upload', resumeUploadMiddleware, async (req, res, next) => {
  try {
    const { originalname, buffer, size } = req.file;

    // Step 1: Attempt plain text extraction
    const extractedText = await extractTextFromPdf(buffer);

    // Step 2: Analyze resume using Gemini
    // If extractedText is empty (e.g. scanned image PDF), Gemini OCRs the PDF directly!
    const analysisResult = await analyzeResumeWithGemini({
      resumeText: extractedText,
      pdfBuffer: buffer,
    });

    const finalPlainText = analysisResult.extracted_text || extractedText || '';

    // Step 3: Insert record and binary PDF data into `resumes` table in Neon DB
    const resumeInsertRes = await query(
      `INSERT INTO resumes (user_id, file_name, file_size, file_data, extracted_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, file_name, file_size, created_at`,
      [req.userId, originalname, size || buffer.length, buffer, finalPlainText]
    );

    const resumeRow = resumeInsertRes.rows[0];

    // Step 4: Insert record into `analyses` table in Neon DB
    const analysisInsertRes = await query(
      `INSERT INTO analyses (user_id, resume_id, result)
       VALUES ($1, $2, $3)
       RETURNING id, resume_id, result, created_at`,
      [req.userId, resumeRow.id, JSON.stringify(analysisResult)]
    );

    const analysisRow = analysisInsertRes.rows[0];

    res.status(201).json({
      message: 'Resume analyzed and saved successfully.',
      resume: resumeRow,
      analysis: analysisRow,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
