'use strict';

const { Router } = require('express');
const {
  getAllResearchDev,
  getResearchDevById,
  createResearchDev,
  updateResearchDev,
  deleteResearchDev,
} = require('../controllers/researchDev.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── R&D Routes ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/research-dev
 * @desc    Get paginated list of R&D entries
 * @query   page, limit, search (by title)
 * @access  Private
 */
// router.get('/', protect, getAllResearchDev);
router.get('/', getAllResearchDev);

/**
 * @route   POST /api/research-dev
 * @desc    Create a new R&D entry
 * @body    { title*, descriptionTitle?, description?, image? }
 * @access  Private
 */
// router.post('/', protect, createResearchDev);
router.post('/', createResearchDev);

/**
 * @route   GET /api/research-dev/:id
 * @desc    Get a single R&D entry
 * @access  Private
 */
// router.get('/:id', protect, getResearchDevById);
router.get('/:id', getResearchDevById);

/**
 * @route   PATCH /api/research-dev/:id
 * @desc    Update an R&D entry
 * @body    { title?, descriptionTitle?, description?, image? }
 * @access  Private
 */
// router.patch('/:id', protect, updateResearchDev);
router.patch('/:id', updateResearchDev);

/**
 * @route   DELETE /api/research-dev/:id
 * @desc    Delete an R&D entry
 * @access  Private
 */
// router.delete('/:id', protect, deleteResearchDev);
router.delete('/:id', deleteResearchDev);

module.exports = router;
