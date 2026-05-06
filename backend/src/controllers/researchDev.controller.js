'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const researchDevService        = require('../services/researchDev.service');

// ─── GET /api/research-dev ────────────────────────────────────────────────────
const getAllResearchDev = asyncHandler(async (req, res) => {
  const page   = parseInt(req.query.page,  10) || 1;
  const limit  = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || undefined;

  const result = await researchDevService.getAllResearchDev({ page, limit, search });

  return res.status(200).json(
    new ApiResponse(200, 'R&D entries fetched successfully', result)
  );
});

// ─── GET /api/research-dev/:id ────────────────────────────────────────────────
const getResearchDevById = asyncHandler(async (req, res) => {
  const entry = await researchDevService.getResearchDevById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'R&D entry fetched successfully', entry)
  );
});

// ─── POST /api/research-dev ──────────────────────────────────────────────────
const createResearchDev = asyncHandler(async (req, res) => {
  const { title, descriptionTitle, description, image } = req.body;

  if (!title) {
    throw new ApiError(400, 'Title is required.');
  }

  const entry = await researchDevService.createResearchDev({
    title, descriptionTitle, description, image,
  });

  return res.status(201).json(
    new ApiResponse(201, 'R&D entry created successfully', entry)
  );
});

// ─── PATCH /api/research-dev/:id ─────────────────────────────────────────────
const updateResearchDev = asyncHandler(async (req, res) => {
  const updated = await researchDevService.updateResearchDev(req.params.id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'R&D entry updated successfully', updated)
  );
});

// ─── DELETE /api/research-dev/:id ────────────────────────────────────────────
const deleteResearchDev = asyncHandler(async (req, res) => {
  const result = await researchDevService.deleteResearchDev(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

module.exports = {
  getAllResearchDev,
  getResearchDevById,
  createResearchDev,
  updateResearchDev,
  deleteResearchDev,
};
