'use strict';

const { Router } = require('express');
const multer = require('multer');
const {
  getCaseTaking,
  upsertCaseTaking,
  uploadCaseImages,
} = require('../controllers/caseTaking.controller');

// const { protect } = require('../middleware/auth.middleware');

// Multer memory storage for case-taking image uploads (max 10 files, 5MB each)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
    }
  },
});

const router = Router({ mergeParams: true });

// ─── Case Taking Routes ──────────────────────────────────────────────────────

/**
 * @route   GET /api/patients/:patientId/case-taking
 * @desc    Get case taking record for a patient (includes patient info)
 * @access  Private
 */
// router.get('/', protect, getCaseTaking);
router.get('/', getCaseTaking);

/**
 * @route   PUT /api/patients/:patientId/case-taking
 * @desc    Create or update case taking record (upsert)
 * @body    { historyTakenBy, beforeImages, afterImages, notes }
 * @access  Private
 */
// router.put('/', protect, upsertCaseTaking);
router.put('/', upsertCaseTaking);

/**
 * @route   POST /api/patients/:patientId/case-taking/images
 * @desc    Upload before/after images for case taking
 * @body    multipart/form-data — type ("before"|"after") + images[] files
 * @access  Private
 */
// router.post('/images', protect, upload.array('images', 10), uploadCaseImages);
router.post('/images', upload.array('images', 10), uploadCaseImages);

module.exports = router;
