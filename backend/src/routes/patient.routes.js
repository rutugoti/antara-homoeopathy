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

// const { protect } = require('../middlewares/auth.middleware');

const router = Router();

// ─── Patient Routes ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/patients
 * @desc    Get paginated list of active patients
 * @query   page, limit, search, branch
 * @access  Private
 */
// router.get('/', protect, getAllPatients);
router.get('/', getAllPatients);

/**
 * @route   POST /api/patients
 * @desc    Create a new patient (fileId auto-generated)
 * @body    { firstName, lastName, gender, dateOfBirth, phone, email, address, branch, bloodGroup }
 * @access  Private
 */
// router.post('/', protect, createPatient);
router.post('/', createPatient);

/**
 * @route   GET /api/patients/:id
 * @desc    Get patient details + last 5 appointments + last 5 prescriptions
 * @access  Private
 */
// router.get('/:id', protect, getPatientById);
router.get('/:id', getPatientById);

/**
 * @route   PATCH /api/patients/:id
 * @desc    Update a patient's details (partial update)
 * @body    Any updatable patient fields
 * @access  Private
 */
// router.patch('/:id', protect, updatePatient);
router.patch('/:id', updatePatient);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Soft-delete a patient (sets isActive = false)
 * @access  Private
 */
// router.delete('/:id', protect, deletePatient);
router.delete('/:id', deletePatient);

/**
 * @route   POST /api/patients/:id/book-appointment
 * @desc    Book a new appointment for a patient
 * @body    { date, time, branch, reason, doctorId }
 * @access  Private
 */
// router.post('/:id/book-appointment', protect, bookAppointment);
router.post('/:id/book-appointment', bookAppointment);

module.exports = router;
