import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { HttpError } from '../utils/errors.js';

dotenv.config();

export const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const getGeminiClient = () => {
  // Re-read dotenv in case user updated server/.env while server is running
  dotenv.config();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey.trim() === '') {
    throw new HttpError(
      400,
      'Gemini API key is missing. Please add your GEMINI_API_KEY to server/.env (get a free key at https://aistudio.google.com).'
    );
  }

  return new GoogleGenAI({ apiKey });
};
