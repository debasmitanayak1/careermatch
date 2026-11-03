import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { HttpError } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'careermatch_secret_jwt_fallback_key';

/**
 * POST /api/auth/signup — Create a new account
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !email.includes('@')) {
      throw new HttpError(400, 'Please provide a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new HttpError(400, 'Password must be at least 6 characters long.');
    }

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const insertRes = await query(
      `INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, created_at`,
      [email.trim().toLowerCase(), passwordHash, (fullName || '').trim()]
    );

    const newUser = insertRes.rows[0];

    // Issue JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login — Sign in with email and password
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required.');
    }

    const userRes = await query(
      'SELECT id, email, password_hash, full_name FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const user = userRes.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me — Return current user details
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userRes = await query(
      'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (userRes.rows.length === 0) {
      throw new HttpError(404, 'User profile not found.');
    }

    const user = userRes.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/profile — Update user full name
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const updateRes = await query(
      `UPDATE users 
       SET full_name = $1, updated_at = timezone('utc', now()) 
       WHERE id = $2 
       RETURNING id, email, full_name`,
      [(fullName || '').trim(), req.userId]
    );

    if (updateRes.rows.length === 0) {
      throw new HttpError(404, 'User profile not found.');
    }

    const updated = updateRes.rows[0];
    res.json({
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
