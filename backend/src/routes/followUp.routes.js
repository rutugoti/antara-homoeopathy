'use strict';

const { Router } = require('express');
const {
  getFollowUps,
  createFollowUp,
  getRemedyHistory,
} = require('../controllers/followUp.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router({ mergeParams: true });

// ─── Follow Up Routes ────────────────────────────────────────────────────────

/**
 * @route   GET /api/patients/:patientId/follow-ups
 * @desc    Get paginated follow-up history for a patient
 * @query   page, limit
 * @access  Private
 */
// router.get('/', protect, getFollowUps);
router.get('/', getFollowUps);

/**
 * @route   POST /api/patients/:patientId/follow-ups
 * @desc    Create a new follow-up entry
 * @body    { followUp*, weight, bp, appointmentCharge, historyTakenBy*, remedy*, dosage, repetition, potency*, days, prescriptionType }
 * @access  Private
 */
// router.post('/', protect, createFollowUp);
router.post('/', createFollowUp);

/**
 * @route   GET /api/patients/:patientId/remedy-history
 * @desc    Get paginated remedy history (remedy, potency, date from follow-ups)
 * @query   page, limit
 * @access  Private
 */
// router.get('/remedy-history', protect, getRemedyHistory);
router.get('/remedy-history', getRemedyHistory);

module.exports = router;
