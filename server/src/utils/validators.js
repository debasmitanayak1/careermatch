import { HttpError } from './errors.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateUuid = (id, fieldName = 'ID') => {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new HttpError(400, `Invalid ${fieldName}: must be a valid UUID.`);
  }
};

export const validateJobMatchInput = (jobTitle, jobDescription) => {
  if (jobTitle && typeof jobTitle === 'string' && jobTitle.length > 100) {
    throw new HttpError(400, 'Job title cannot exceed 100 characters.');
  }

  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new HttpError(400, 'Job description is required.');
  }

  const trimmedDesc = jobDescription.trim();
  if (trimmedDesc.length < 50 || trimmedDesc.length > 8000) {
    throw new HttpError(400, 'Job description must be between 50 and 8000 characters.');
  }
};
