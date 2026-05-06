'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const patientService = require('../services/patient.service');

// ─── GET /api/patients ────────────────────────────────────────────────────────
/**
 * Returns a paginated, optionally filtered list of active patients.
 * Query params: page, limit, search, branch
 */
const getAllPatients = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search  || undefined;
  const branch = req.query.branch  || undefined;

  const result = await patientService.getAllPatients({ page, limit, search, branch });

  return res.status(200).json(
    new ApiResponse(200, 'Patients fetched successfully', result)
  );
});

// ─── GET /api/patients/:id ────────────────────────────────────────────────────
/**
 * Returns a single patient with their last 5 appointments and prescriptions.
 */
const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const patient = await patientService.getPatientById(id);

  return res.status(200).json(
    new ApiResponse(200, 'Patient fetched successfully', patient)
  );
});

// ─── POST /api/patients ───────────────────────────────────────────────────────
/**
 * Creates a new patient with an auto-generated fileId.
 * Required body fields: firstName, lastName, gender, dateOfBirth, phone, branch
 */
const createPatient = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    email,
    address,
    branch,
    bloodGroup,
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!firstName)   missing.push('firstName');
  if (!lastName)    missing.push('lastName');
  if (!gender)      missing.push('gender');
  if (!dateOfBirth) missing.push('dateOfBirth');
  if (!phone)       missing.push('phone');
  if (!branch)      missing.push('branch');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((field) => ({ field, message: `${field} is required.` }))
    );
  }

  const patient = await patientService.createPatient({
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    email,
    address,
    branch,
    bloodGroup,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Patient created successfully', patient)
  );
});

// ─── PATCH /api/patients/:id ──────────────────────────────────────────────────
/**
 * Partially updates a patient's details.
 * All body fields are optional; only provided fields are updated.
 */
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await patientService.updatePatient(id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'Patient updated successfully', updated)
  );
});

// ─── DELETE /api/patients/:id ─────────────────────────────────────────────────
/**
 * Soft-deletes a patient (sets isActive = false).
 */
const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await patientService.deletePatient(id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

// ─── POST /api/patients/:id/book-appointment ──────────────────────────────────
/**
 * Books a new PENDING appointment for an existing patient.
 * Required body fields: date, time, branch
 */
const bookAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, time, branch, reason, doctorId } = req.body;

  const missing = [];
  if (!date)   missing.push('date');
  if (!time)   missing.push('time');
  if (!branch) missing.push('branch');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((field) => ({ field, message: `${field} is required.` }))
    );
  }

  const appointment = await patientService.bookAppointmentForPatient(id, {
    date,
    time,
    branch,
    reason,
    doctorId,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Appointment booked successfully', appointment)
  );
});

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  bookAppointment,
};
