import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'careermatch_secret_jwt_fallback_key';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpError(401, 'Access token is required');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.user = { id: decoded.userId, email: decoded.email };
      next();
    } catch (jwtErr) {
      throw new HttpError(401, 'Invalid or expired session token');
    }
  } catch (err) {
    next(err);
  }
};
