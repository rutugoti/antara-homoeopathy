'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const prescriptionService       = require('../services/prescription.service');

// ─── GET /api/prescriptions ──────────────────────────────────────────────────
/**
 * Get all prescriptions (across all patients), paginated with search.
 */
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || undefined;

  const result = await prescriptionService.getAllPrescriptions({ page, limit, search });

  return res.status(200).json(
    new ApiResponse(200, 'Prescriptions fetched successfully', result)
  );
});

// ─── GET /api/prescriptions/patient/:patientId ───────────────────────────────
/**
 * Get prescriptions for a specific patient, paginated with search.
 */
const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || undefined;

  const result = await prescriptionService.getPrescriptionsByPatient(patientId, { page, limit, search });

  return res.status(200).json(
    new ApiResponse(200, 'Patient prescriptions fetched successfully', result)
  );
});

// ─── GET /api/prescriptions/:id ──────────────────────────────────────────────
/**
 * Get a single prescription with full patient details.
 */
const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Prescription fetched successfully', prescription)
  );
});

// ─── POST /api/prescriptions ─────────────────────────────────────────────────
/**
 * Create a new prescription.
 */
const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, title, list, content } = req.body;

  const missing = [];
  if (!patientId) missing.push('patientId');
  if (!title)     missing.push('title');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const prescription = await prescriptionService.createPrescription({
    patientId, title, list, content,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Prescription created successfully', prescription)
  );
});

// ─── PATCH /api/prescriptions/:id ────────────────────────────────────────────
/**
 * Update a prescription (title, list, content).
 */
const updatePrescription = asyncHandler(async (req, res) => {
  const updated = await prescriptionService.updatePrescription(req.params.id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'Prescription updated successfully', updated)
  );
});

// ─── DELETE /api/prescriptions/:id ───────────────────────────────────────────
/**
 * Delete a prescription.
 */
const deletePrescription = asyncHandler(async (req, res) => {
  const result = await prescriptionService.deletePrescription(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

module.exports = {
  getAllPrescriptions,
  getPrescriptionsByPatient,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
};
