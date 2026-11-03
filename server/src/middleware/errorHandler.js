import { HttpError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.statusCode && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message || message;
  } else if (err.status && typeof err.status === 'number') {
    statusCode = err.status;
    message = err.message || message;
  } else if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else {
    // Log unexpected errors on server
    console.error('Unhandled server error:', err);
    message = err.message || 'An unexpected error occurred';
  }

  res.status(statusCode).json({ error: message });
};
