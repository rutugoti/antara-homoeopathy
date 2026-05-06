'use strict';

const { Router } = require('express');
const multer = require('multer');
const {
  getAllMateriaMedica,
  getMateriaMedicaById,
  createMateriaMedica,
  updateMateriaMedica,
  deleteMateriaMedica,
  importFile,
} = require('../controllers/materiaMedica.controller');

// const { protect } = require('../middleware/auth.middleware');

// Multer memory storage for CSV import (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// ─── Materia Medica Routes ───────────────────────────────────────────────────

/**
 * @route   POST /api/materia-medica/import
 * @desc    Import materia medica entries from CSV file
 * @body    multipart/form-data — file field named "file"
 * @note    Must be defined BEFORE /:id to avoid route collision
 * @access  Private
 */
// router.post('/import', protect, upload.single('file'), importFile);
router.post('/import', upload.single('file'), importFile);

/**
 * @route   GET /api/materia-medica
 * @desc    Get paginated list of materia medica entries
 * @query   page, limit, search (by code or product name)
 * @access  Private
 */
// router.get('/', protect, getAllMateriaMedica);
router.get('/', getAllMateriaMedica);

/**
 * @route   POST /api/materia-medica
 * @desc    Create a new materia medica entry
 * @body    { code*, productName*, potency6CH?, potency30CH?, potency200CH?, potency1M? }
 * @access  Private
 */
// router.post('/', protect, createMateriaMedica);
router.post('/', createMateriaMedica);

/**
 * @route   GET /api/materia-medica/:id
 * @desc    Get a single materia medica entry
 * @access  Private
 */
// router.get('/:id', protect, getMateriaMedicaById);
router.get('/:id', getMateriaMedicaById);

/**
 * @route   PATCH /api/materia-medica/:id
 * @desc    Update a materia medica entry
 * @body    { code?, productName?, potency6CH?, potency30CH?, potency200CH?, potency1M? }
 * @access  Private
 */
// router.patch('/:id', protect, updateMateriaMedica);
router.patch('/:id', updateMateriaMedica);

/**
 * @route   DELETE /api/materia-medica/:id
 * @desc    Delete a materia medica entry
 * @access  Private
 */
// router.delete('/:id', protect, deleteMateriaMedica);
router.delete('/:id', deleteMateriaMedica);

module.exports = router;
