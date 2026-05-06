'use strict';

const asyncHandler         = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const patientService       = require('../services/patient.service');
const { uploadImage }      = require('../services/cloudinary.service');

// ─── GET /api/patients ────────────────────────────────────────────────────────
const getAllPatients = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || undefined;
  const branch = req.query.branch || undefined;

  const result = await patientService.getAllPatients({ page, limit, search, branch });

  return res.status(200).json(
    new ApiResponse(200, 'Patients fetched successfully', result)
  );
});

// ─── GET /api/patients/:id ────────────────────────────────────────────────────
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Patient fetched successfully', patient)
  );
});

// ─── POST /api/patients ───────────────────────────────────────────────────────
const createPatient = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, note, age,
  } = req.body;

  // ── Required field validation ──────────────────────────────────────────────
  const missing = [];
  if (!firstName) missing.push('firstName');
  if (!lastName)  missing.push('lastName');
  if (!phone)     missing.push('phone');
  if (!branch)    missing.push('branch');
  if (!dateOfBirth && !age) missing.push('dateOfBirth or age');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  // ── Handle optional profile image upload ───────────────────────────────────
  let profileImage = req.body.profileImage ?? null;
  if (req.file) {
    profileImage = await uploadImage(req.file.buffer);
  }

  const patient = await patientService.createPatient({
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, profileImage, note,
    age: age ? parseInt(age, 10) : null,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Patient created successfully', patient)
  );
});

// ─── PATCH /api/patients/:id ──────────────────────────────────────────────────
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, note, age,
  } = req.body;

  // ── Handle optional profile image upload ───────────────────────────────────
  let profileImage = req.body.profileImage;
  if (req.file) {
    profileImage = await uploadImage(req.file.buffer);
  }

  const updated = await patientService.updatePatient(id, {
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, profileImage, note,
    age: age !== undefined ? parseInt(age, 10) : undefined,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Patient updated successfully', updated)
  );
});

// ─── DELETE /api/patients/:id ─────────────────────────────────────────────────
const deletePatient = asyncHandler(async (req, res) => {
  const result = await patientService.deletePatient(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

// ─── POST /api/patients/:id/book-appointment ──────────────────────────────────
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
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const appointment = await patientService.bookAppointmentForPatient(id, {
    date, time, branch, reason, doctorId,
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
