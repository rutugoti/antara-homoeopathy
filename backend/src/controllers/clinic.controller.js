'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const clinicService             = require('../services/clinic.service');

// ─── GET /api/clinics ─────────────────────────────────────────────────────────
const getAllClinics = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || undefined;

  const result = await clinicService.getAllClinics({ page, limit, search });

  return res.status(200).json(
    new ApiResponse(200, 'Clinics fetched successfully', result)
  );
});

// ─── GET /api/clinics/:id ─────────────────────────────────────────────────────
const getClinicById = asyncHandler(async (req, res) => {
  const clinic = await clinicService.getClinicById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Clinic fetched successfully', clinic)
  );
});

// ─── POST /api/clinics ────────────────────────────────────────────────────────
const createClinic = asyncHandler(async (req, res) => {
  const { title, address, contact, officeType, location } = req.body;

  if (!title) {
    throw new ApiError(400, 'Title is required.');
  }

  const clinic = await clinicService.createClinic({
    title, address, contact, officeType, location,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Clinic created successfully', clinic)
  );
});

// ─── PATCH /api/clinics/:id ───────────────────────────────────────────────────
const updateClinic = asyncHandler(async (req, res) => {
  const updated = await clinicService.updateClinic(req.params.id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'Clinic updated successfully', updated)
  );
});

// ─── DELETE /api/clinics/:id ──────────────────────────────────────────────────
const deleteClinic = asyncHandler(async (req, res) => {
  const result = await clinicService.deleteClinic(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

module.exports = {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
};
