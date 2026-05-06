'use strict';

const { Router } = require('express');
const {
  getDashboard,
  getTodaysAppointments,
  updateAppointmentStatus,
  getHolidays,
  getUpcomingEvents,
} = require('../controllers/dashboard.controller');

// const { protect } = require('../middlewares/auth.middleware');

const router = Router();

// ─── Dashboard Routes ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/dashboard
 * @desc    Full dashboard payload (summary + appointments + holidays + events)
 * @access  Private
 */
// router.get('/', protect, getDashboard);
router.get('/', getDashboard);

/**
 * @route   GET /api/dashboard/appointments/today
 * @desc    Today's appointments list
 * @access  Private
 */
// router.get('/appointments/today', protect, getTodaysAppointments);
router.get('/appointments/today', getTodaysAppointments);

/**
 * @route   PATCH /api/dashboard/appointments/:id/status
 * @desc    Update appointment status
 * @body    { status: "IN" | "CLOSED" | "CANCELLED" }
 * @access  Private
 */
// router.patch('/appointments/:id/status', protect, updateAppointmentStatus);
router.patch('/appointments/:id/status', updateAppointmentStatus);

/**
 * @route   GET /api/dashboard/holidays
 * @desc    All holidays (with isPast flag)
 * @access  Private
 */
// router.get('/holidays', protect, getHolidays);
router.get('/holidays', getHolidays);

/**
 * @route   GET /api/dashboard/events
 * @desc    Upcoming published events
 * @access  Private
 */
// router.get('/events', protect, getUpcomingEvents);
router.get('/events', getUpcomingEvents);

module.exports = router;
