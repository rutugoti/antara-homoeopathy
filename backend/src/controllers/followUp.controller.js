'use strict';

const asyncHandler          = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const followUpService       = require('../services/followUp.service');

// ─── GET /api/patients/:patientId/follow-ups ──────────────────────────────────
const getFollowUps = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await followUpService.getFollowUps(patientId, { page, limit });

  return res.status(200).json(
    new ApiResponse(200, 'Follow-ups fetched successfully', result)
  );
});

// ─── POST /api/patients/:patientId/follow-ups ─────────────────────────────────
const createFollowUp = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const {
    followUp, weight, bp, appointmentCharge,
    historyTakenBy, remedy, dosage, repetition,
    potency, days, prescriptionType,
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!followUp)       missing.push('followUp');
  if (!historyTakenBy) missing.push('historyTakenBy');
  if (!remedy)         missing.push('remedy');
  if (!potency)        missing.push('potency');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const entry = await followUpService.createFollowUp(patientId, {
    followUp, weight, bp, appointmentCharge,
    historyTakenBy, remedy, dosage, repetition,
    potency, days, prescriptionType,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Follow-up created successfully', entry)
  );
});

// ─── GET /api/patients/:patientId/remedy-history ──────────────────────────────
const getRemedyHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await followUpService.getRemedyHistory(patientId, { page, limit });

  return res.status(200).json(
    new ApiResponse(200, 'Remedy history fetched successfully', result)
  );
});

module.exports = {
  getFollowUps,
  createFollowUp,
  getRemedyHistory,
};
