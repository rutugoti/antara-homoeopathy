'use strict';

const { Router } = require('express');
const {
  lookupPatient,
  bookOldPatient,
  bookNewPatient,
  getPayments,
} = require('../controllers/book.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── Book Appointment Routes ─────────────────────────────────────────────────

/**
 * @route   GET /api/book/lookup?fileId=AH-00123
 * @desc    Search for existing patient by File ID (old patient flow)
 * @query   fileId* (e.g. AH-00123)
 * @access  Private
 */
// router.get('/lookup', protect, lookupPatient);
router.get('/lookup', lookupPatient);

/**
 * @route   POST /api/book/old-patient
 * @desc    Book appointment for an existing patient
 * @body    { fileId*, date*, time*, branch, reason, notes, appointmentBy, doctorId,
 *            paymentAmount, paymentMethod (CASH|UPI|CARD|ONLINE|OTHER), paymentNotes }
 * @access  Private
 */
// router.post('/old-patient', protect, bookOldPatient);
router.post('/old-patient', bookOldPatient);

/**
 * @route   POST /api/book/new-patient
 * @desc    Register a new patient and book their first appointment in one step
 * @body    {
 *            // Patient fields
 *            firstName*, lastName*, phone*, gender, dateOfBirth, email, address,
 *            bloodGroup, branch, occupation, reference, maritalStatus, education, age,
 *            // Appointment fields
 *            date*, time*, reason, notes, appointmentBy, doctorId,
 *            // Payment fields
 *            paymentAmount, paymentMethod, paymentNotes
 *          }
 * @access  Private
 */
// router.post('/new-patient', protect, bookNewPatient);
router.post('/new-patient', bookNewPatient);

/**
 * @route   GET /api/book/payments/:patientId
 * @desc    Get payment history for a patient
 * @query   page, limit
 * @access  Private
 */
// router.get('/payments/:patientId', protect, getPayments);
router.get('/payments/:patientId', getPayments);

module.exports = router;
