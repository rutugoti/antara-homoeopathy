'use strict';

const multer = require('multer');

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE   = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Storage ──────────────────────────────────────────────────────────────────
// Keep the file in memory (Buffer) so we can pipe it straight to Cloudinary
// without writing anything to disk.
const storage = multer.memoryStorage();

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

// ─── Multer Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Middleware for a single "profileImage" file upload.
 * Stores the file in req.file as a Buffer — no disk writes.
 * Throws multer errors (caught by global error handler) for invalid type / size.
 */
const uploadSingle = (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (!err) return next();

    // Normalise multer errors into plain Error objects with clear messages
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(new Error('File size must be less than 5MB'));
    }

    next(err);
  });
};

module.exports = { uploadSingle };
