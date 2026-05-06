'use strict';

const { Router } = require('express');
const {
  getAppointmentsByDate,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  updateStatus,
  cancelAppointment,
  getAvailableSlots,
} = require('../controllers/appointment.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── Appointment Routes ──────────────────────────────────────────────────────

/**
 * @route   GET /api/appointments/available-slots
 * @desc    Get available time slots for a date (from settings)
 * @query   date* (YYYY-MM-DD), branch?
 * @access  Private
 * @note    Must be defined BEFORE /:id to avoid route collision
 */
// router.get('/available-slots', protect, getAvailableSlots);
router.get('/available-slots', getAvailableSlots);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for a specific date, optionally by branch
 * @query   date* (YYYY-MM-DD), branch? (MAIN | BRANCH_1 | BRANCH_2)
 * @access  Private
 */
// router.get('/', protect, getAppointmentsByDate);
router.get('/', getAppointmentsByDate);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment (endTime + charge auto-computed from settings)
 * @body    { patientId*, date*, time*, branch, reason, notes, charge,
 *            appointmentBy, doctorId, isNewPatient }
 * @access  Private
 */
// router.post('/', protect, createAppointment);
router.post('/', createAppointment);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a single appointment with patient & doctor details
 * @access  Private
 */
// router.get('/:id', protect, getAppointmentById);
router.get('/:id', getAppointmentById);

/**
 * @route   PATCH /api/appointments/:id
 * @desc    Update appointment details
 * @body    { date, time, branch, reason, notes, charge, appointmentBy, doctorId }
 * @access  Private
 */
// router.patch('/:id', protect, updateAppointment);
router.patch('/:id', updateAppointment);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @body    { status: "PENDING" | "CONFIRMED" | "IN" | "CLOSED" | "CANCELLED" }
 * @access  Private
 */
// router.patch('/:id/status', protect, updateStatus);
router.patch('/:id/status', updateStatus);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Quick cancel shortcut
 * @access  Private
 */
// router.patch('/:id/cancel', protect, cancelAppointment);
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
