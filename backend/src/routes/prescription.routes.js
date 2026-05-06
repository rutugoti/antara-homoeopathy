'use strict';

const { Router } = require('express');
const {
  getAllPrescriptions,
  getPrescriptionsByPatient,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
} = require('../controllers/prescription.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── Prescription Routes ─────────────────────────────────────────────────────

/**
 * @route   GET /api/prescriptions
 * @desc    Get all prescriptions (paginated, searchable by title & list)
 * @query   page, limit, search
 * @access  Private
 */
// router.get('/', protect, getAllPrescriptions);
router.get('/', getAllPrescriptions);

/**
 * @route   GET /api/prescriptions/patient/:patientId
 * @desc    Get prescriptions for a specific patient
 * @query   page, limit, search
 * @access  Private
 */
// router.get('/patient/:patientId', protect, getPrescriptionsByPatient);
router.get('/patient/:patientId', getPrescriptionsByPatient);

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new prescription
 * @body    { patientId*, title*, list?, content? }
 * @access  Private
 */
// router.post('/', protect, createPrescription);
router.post('/', createPrescription);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get a single prescription with patient details
 * @access  Private
 */
// router.get('/:id', protect, getPrescriptionById);
router.get('/:id', getPrescriptionById);

/**
 * @route   PATCH /api/prescriptions/:id
 * @desc    Update a prescription
 * @body    { title?, list?, content? }
 * @access  Private
 */
// router.patch('/:id', protect, updatePrescription);
router.patch('/:id', updatePrescription);

/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Delete a prescription
 * @access  Private
 */
// router.delete('/:id', protect, deletePrescription);
router.delete('/:id', deletePrescription);

module.exports = router;
