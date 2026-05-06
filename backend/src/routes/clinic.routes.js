'use strict';

const { Router } = require('express');
const {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
} = require('../controllers/clinic.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── Clinic Information Routes ───────────────────────────────────────────────

/**
 * @route   GET /api/clinics
 * @desc    Get paginated list of clinics
 * @query   page, limit, search (by title, address, contact, officeType, location)
 * @access  Private
 */
// router.get('/', protect, getAllClinics);
router.get('/', getAllClinics);

/**
 * @route   POST /api/clinics
 * @desc    Add a new clinic (officeId auto-generated)
 * @body    { title*, address?, contact?, officeType?, location? }
 * @access  Private
 */
// router.post('/', protect, createClinic);
router.post('/', createClinic);

/**
 * @route   GET /api/clinics/:id
 * @desc    Get a single clinic
 * @access  Private
 */
// router.get('/:id', protect, getClinicById);
router.get('/:id', getClinicById);

/**
 * @route   PATCH /api/clinics/:id
 * @desc    Update a clinic
 * @body    { title?, address?, contact?, officeType?, location? }
 * @access  Private
 */
// router.patch('/:id', protect, updateClinic);
router.patch('/:id', updateClinic);

/**
 * @route   DELETE /api/clinics/:id
 * @desc    Delete a clinic
 * @access  Private
 */
// router.delete('/:id', protect, deleteClinic);
router.delete('/:id', deleteClinic);

module.exports = router;
