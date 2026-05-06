'use strict';

const { Router } = require('express');
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  bookAppointment,
} = require('../controllers/patient.controller');
const { uploadSingle } = require('../middleware/upload.middleware');

// const { protect } = require('../middlewares/auth.middleware');

const router = Router();

// ─── Patient Routes ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/patients
 * @desc    Paginated + filtered list of active patients
 * @query   page, limit, search, branch
 * @access  Private
 */
// router.get('/', protect, getAllPatients);
router.get('/', getAllPatients);

/**
 * @route   POST /api/patients
 * @desc    Create a new patient (fileId auto-generated)
 * @body    multipart/form-data — patient fields + optional profileImage file
 * @access  Private
 */
// router.post('/', protect, uploadSingle, createPatient);
router.post('/', uploadSingle, createPatient);

/**
 * @route   GET /api/patients/:id
 * @desc    Get full patient profile + last 5 appointments + last 5 prescriptions
 * @access  Private
 */
// router.get('/:id', protect, getPatientById);
router.get('/:id', getPatientById);

/**
 * @route   PATCH /api/patients/:id
 * @desc    Partial update of a patient's details
 * @body    multipart/form-data — any updatable patient fields + optional profileImage file
 * @access  Private
 */
// router.patch('/:id', protect, uploadSingle, updatePatient);
router.patch('/:id', uploadSingle, updatePatient);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Soft-delete a patient (isActive = false)
 * @access  Private
 */
// router.delete('/:id', protect, deletePatient);
router.delete('/:id', deletePatient);

/**
 * @route   POST /api/patients/:id/book-appointment
 * @desc    Book a new PENDING appointment for a patient
 * @body    { date, time, branch, reason, doctorId }
 * @access  Private
 */
// router.post('/:id/book-appointment', protect, bookAppointment);
router.post('/:id/book-appointment', bookAppointment);

module.exports = router;
