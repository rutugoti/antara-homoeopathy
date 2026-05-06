'use strict';

const { Router } = require('express');
const {
  getSettings,
  upsertSettings,
  updateWorkingDays,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} = require('../controllers/appointmentSettings.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── Appointment Slot Time & Fee Settings ─────────────────────────────────────

/**
 * @route   GET /api/settings/appointment
 * @desc    Get current appointment settings (slot times, fees, working days)
 * @access  Private
 */
// router.get('/appointment', protect, getSettings);
router.get('/appointment', getSettings);

/**
 * @route   PUT /api/settings/appointment
 * @desc    Save / update appointment slot time setup & fees
 * @body    { morningStartTime, morningEndTime, afternoonStartTime, afternoonEndTime,
 *            oldPatientTime, newPatientTime, oldPatientFee, newPatientFee }
 * @access  Private
 */
// router.put('/appointment', protect, upsertSettings);
router.put('/appointment', upsertSettings);

// ─── Day Settings ─────────────────────────────────────────────────────────────

/**
 * @route   PUT /api/settings/day
 * @desc    Update which days the clinic is open (full day list)
 * @body    { workingDays: ["Monday", "Tuesday", ...] }
 * @access  Private
 */
// router.put('/day', protect, updateWorkingDays);
router.put('/day', updateWorkingDays);

// ─── Holiday Management ──────────────────────────────────────────────────────

/**
 * @route   GET /api/settings/holidays
 * @desc    Get paginated holiday list with optional type filter
 * @query   page, limit, type (all | upcoming | past)
 * @access  Private
 */
// router.get('/holidays', protect, getHolidays);
router.get('/holidays', getHolidays);

/**
 * @route   POST /api/settings/holidays
 * @desc    Create a new holiday
 * @body    { title*, date*, morningTime?, afternoonTime? }
 * @note    Leave morningTime & afternoonTime empty for full-day holiday.
 *          If provided, they represent working hours on that holiday.
 * @access  Private
 */
// router.post('/holidays', protect, createHoliday);
router.post('/holidays', createHoliday);

/**
 * @route   PUT /api/settings/holidays/:id
 * @desc    Update an existing holiday
 * @body    { title, date, morningTime, afternoonTime }
 * @access  Private
 */
// router.put('/holidays/:id', protect, updateHoliday);
router.put('/holidays/:id', updateHoliday);

/**
 * @route   DELETE /api/settings/holidays/:id
 * @desc    Delete a holiday
 * @access  Private
 */
// router.delete('/holidays/:id', protect, deleteHoliday);
router.delete('/holidays/:id', deleteHoliday);

module.exports = router;
