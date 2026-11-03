import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../utils/errors.js';

/**
 * Uploads a resume PDF to the private Supabase storage bucket under <userId>/<timestamp>-<safeFileName>
 */
export const uploadResumeToStorage = async (userId, originalName, buffer) => {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}-${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('resumes')
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new HttpError(500, `Failed to store resume file: ${error.message}`);
  }

  return {
    filePath: data.path,
    fileName: originalName,
    fileSize: buffer.length,
  };
};

/**
 * Removes a file from the private resumes storage bucket
 */
export const deleteResumeFromStorage = async (filePath) => {
  if (!filePath) return;

  const { error } = await supabaseAdmin.storage
    .from('resumes')
    .remove([filePath]);

  if (error) {
    console.error('Storage delete error:', error);
  }
};
