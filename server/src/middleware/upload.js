import multer from 'multer';
import { HttpError } from '../utils/errors.js';

// Store files in memory so we can inspect buffer and extract text before uploading to storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new HttpError(400, 'Only PDF files are allowed.'));
    }
  },
});

export const resumeUploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return next(new HttpError(400, 'File size exceeds 4 MB limit.'));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new HttpError(400, 'No resume file uploaded. Please upload a PDF file under field name "resume".'));
    }

    // Check %PDF signature in file buffer (first 4 bytes)
    const fileHeader = req.file.buffer.subarray(0, 4).toString('ascii');
    if (!fileHeader.startsWith('%PDF')) {
      return next(new HttpError(400, 'Invalid file format: file does not have a valid %PDF header signature.'));
    }

    next();
  });
};
