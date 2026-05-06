'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const appointmentService        = require('../services/appointment.service');

// ─── GET /api/appointments?date=2026-05-06&branch=MAIN ────────────────────────
const getAppointmentsByDate = asyncHandler(async (req, res) => {
  const { date, branch } = req.query;

  if (!date) {
    throw new ApiError(400, 'Date query parameter is required.');
  }

  const appointments = await appointmentService.getAppointmentsByDate({ date, branch });

  return res.status(200).json(
    new ApiResponse(200, 'Appointments fetched successfully', {
      count: appointments.length,
      date,
      branch: branch || 'ALL',
      appointments,
    })
  );
});

// ─── POST /api/appointments ───────────────────────────────────────────────────
const createAppointment = asyncHandler(async (req, res) => {
  const {
    patientId, date, time, branch, reason, notes,
    charge, appointmentBy, doctorId, isNewPatient,
  } = req.body;

  const missing = [];
  if (!patientId) missing.push('patientId');
  if (!date)      missing.push('date');
  if (!time)      missing.push('time');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const appointment = await appointmentService.createAppointment({
    patientId, date, time, branch, reason, notes,
    charge, appointmentBy, doctorId,
    isNewPatient: isNewPatient === true || isNewPatient === 'true',
  });

  return res.status(201).json(
    new ApiResponse(201, 'Appointment created successfully', appointment)
  );
});

// ─── GET /api/appointments/:id ────────────────────────────────────────────────
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Appointment fetched successfully', appointment)
  );
});

// ─── PATCH /api/appointments/:id ──────────────────────────────────────────────
const updateAppointment = asyncHandler(async (req, res) => {
  const updated = await appointmentService.updateAppointment(req.params.id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'Appointment updated successfully', updated)
  );
});

// ─── PATCH /api/appointments/:id/status ───────────────────────────────────────
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required in the request body.');
  }

  const result = await appointmentService.updateStatus(req.params.id, status.toUpperCase());

  return res.status(200).json(
    new ApiResponse(200, 'Appointment status updated successfully', result)
  );
});

// ─── PATCH /api/appointments/:id/cancel ───────────────────────────────────────
const cancelAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentService.cancelAppointment(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Appointment cancelled successfully', result)
  );
});

// ─── GET /api/appointments/available-slots?date=...&branch=... ────────────────
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date, branch } = req.query;

  if (!date) {
    throw new ApiError(400, 'Date query parameter is required.');
  }

  const result = await appointmentService.getAvailableSlots({ date, branch });

  return res.status(200).json(
    new ApiResponse(200, 'Available slots fetched successfully', result)
  );
});

module.exports = {
  getAppointmentsByDate,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  updateStatus,
  cancelAppointment,
  getAvailableSlots,
};
