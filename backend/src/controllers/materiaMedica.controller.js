'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const materiaMedicaService      = require('../services/materiaMedica.service');

// ─── GET /api/materia-medica ──────────────────────────────────────────────────
const getAllMateriaMedica = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || undefined;

  const result = await materiaMedicaService.getAllMateriaMedica({ page, limit, search });

  return res.status(200).json(
    new ApiResponse(200, 'Materia Medica entries fetched successfully', result)
  );
});

// ─── GET /api/materia-medica/:id ──────────────────────────────────────────────
const getMateriaMedicaById = asyncHandler(async (req, res) => {
  const entry = await materiaMedicaService.getMateriaMedicaById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Materia Medica entry fetched successfully', entry)
  );
});

// ─── POST /api/materia-medica ─────────────────────────────────────────────────
const createMateriaMedica = asyncHandler(async (req, res) => {
  const { code, productName, potency6CH, potency30CH, potency200CH, potency1M } = req.body;

  const missing = [];
  if (!code)        missing.push('code');
  if (!productName) missing.push('productName');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const entry = await materiaMedicaService.createMateriaMedica({
    code, productName, potency6CH, potency30CH, potency200CH, potency1M,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Materia Medica entry created successfully', entry)
  );
});

// ─── PATCH /api/materia-medica/:id ────────────────────────────────────────────
const updateMateriaMedica = asyncHandler(async (req, res) => {
  const updated = await materiaMedicaService.updateMateriaMedica(req.params.id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'Materia Medica entry updated successfully', updated)
  );
});

// ─── DELETE /api/materia-medica/:id ───────────────────────────────────────────
const deleteMateriaMedica = asyncHandler(async (req, res) => {
  const result = await materiaMedicaService.deleteMateriaMedica(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

// ─── POST /api/materia-medica/import ──────────────────────────────────────────
/**
 * Import entries from a CSV file.
 * Expects multipart/form-data with a file field named "file".
 */
const importFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'CSV file is required. Upload with field name "file".');
  }

  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/csv',
    'text/plain',
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new ApiError(400, 'Only CSV files are allowed.');
  }

  const result = await materiaMedicaService.importFromCSV(req.file.buffer);

  return res.status(200).json(
    new ApiResponse(200, `Import complete: ${result.imported} entries added.`, result)
  );
});

module.exports = {
  getAllMateriaMedica,
  getMateriaMedicaById,
  createMateriaMedica,
  updateMateriaMedica,
  deleteMateriaMedica,
  importFile,
};
