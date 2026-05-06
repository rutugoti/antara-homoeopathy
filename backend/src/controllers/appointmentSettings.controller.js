'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const settingsService           = require('../services/appointmentSettings.service');

// ─── GET /api/settings/appointment ────────────────────────────────────────────
const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();

  return res.status(200).json(
    new ApiResponse(200, 'Appointment settings fetched successfully', settings)
  );
});

// ─── PUT /api/settings/appointment ────────────────────────────────────────────
const upsertSettings = asyncHandler(async (req, res) => {
  const {
    morningStartTime, morningEndTime,
    afternoonStartTime, afternoonEndTime,
    oldPatientTime, newPatientTime,
    oldPatientFee, newPatientFee,
  } = req.body;

  const settings = await settingsService.upsertSettings({
    morningStartTime, morningEndTime,
    afternoonStartTime, afternoonEndTime,
    oldPatientTime, newPatientTime,
    oldPatientFee, newPatientFee,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Appointment settings saved successfully', settings)
  );
});

// ─── PUT /api/settings/day ────────────────────────────────────────────────────
const updateWorkingDays = asyncHandler(async (req, res) => {
  const { workingDays } = req.body;

  if (!workingDays || !Array.isArray(workingDays)) {
    throw new ApiError(400, 'workingDays must be an array of day names.');
  }

  const settings = await settingsService.updateWorkingDays(workingDays);

  return res.status(200).json(
    new ApiResponse(200, 'Working days updated successfully', settings)
  );
});

// ─── GET /api/settings/holidays ───────────────────────────────────────────────
const getHolidays = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const type  = req.query.type || 'all';

  const result = await settingsService.getHolidays({ page, limit, type });

  return res.status(200).json(
    new ApiResponse(200, 'Holidays fetched successfully', result)
  );
});

// ─── POST /api/settings/holidays ──────────────────────────────────────────────
const createHoliday = asyncHandler(async (req, res) => {
  const { title, date, morningTime, afternoonTime } = req.body;

  if (!title) {
    throw new ApiError(400, 'Title is required.');
  }
  if (!date) {
    throw new ApiError(400, 'Date is required.');
  }

  const holiday = await settingsService.createHoliday({
    title, date, morningTime, afternoonTime,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Holiday created successfully', holiday)
  );
});

// ─── PUT /api/settings/holidays/:id ───────────────────────────────────────────
const updateHoliday = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, morningTime, afternoonTime } = req.body;

  const holiday = await settingsService.updateHoliday(id, {
    title, date, morningTime, afternoonTime,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Holiday updated successfully', holiday)
  );
});

// ─── DELETE /api/settings/holidays/:id ────────────────────────────────────────
const deleteHoliday = asyncHandler(async (req, res) => {
  const result = await settingsService.deleteHoliday(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

module.exports = {
  getSettings,
  upsertSettings,
  updateWorkingDays,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};
