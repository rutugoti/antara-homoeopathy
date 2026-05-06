'use strict';

const asyncHandler          = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const caseTakingService     = require('../services/caseTaking.service');
const { uploadImage }       = require('../services/cloudinary.service');

// ─── GET /api/patients/:patientId/case-taking ────────────────────────────────
const getCaseTaking = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const caseTaking = await caseTakingService.getCaseTaking(patientId);

  return res.status(200).json(
    new ApiResponse(200, 'Case taking fetched successfully', caseTaking)
  );
});

// ─── PUT /api/patients/:patientId/case-taking ────────────────────────────────
const upsertCaseTaking = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { historyTakenBy, notes } = req.body;

  // Parse image arrays from body (they may be JSON strings from form-data)
  let beforeImages = req.body.beforeImages ?? undefined;
  let afterImages  = req.body.afterImages  ?? undefined;

  if (typeof beforeImages === 'string') {
    try { beforeImages = JSON.parse(beforeImages); } catch (e) { beforeImages = [beforeImages]; }
  }
  if (typeof afterImages === 'string') {
    try { afterImages = JSON.parse(afterImages); } catch (e) { afterImages = [afterImages]; }
  }

  const caseTaking = await caseTakingService.upsertCaseTaking(patientId, {
    historyTakenBy,
    beforeImages,
    afterImages,
    notes,
  });

  return res.status(200).json(
    new ApiResponse(200, 'Case taking saved successfully', caseTaking)
  );
});

// ─── POST /api/patients/:patientId/case-taking/images ────────────────────────
const uploadCaseImages = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { type } = req.body; // "before" or "after"

  if (!type || !['before', 'after'].includes(type)) {
    throw new ApiError(400, 'Image type is required. Must be "before" or "after".');
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one image file is required.');
  }

  // Upload all files to Cloudinary in parallel
  const uploadPromises = req.files.map((file) =>
    uploadImage(file.buffer, `antara-homoeopathy/patients/case-taking/${type}`)
  );
  const imageUrls = await Promise.all(uploadPromises);

  const caseTaking = await caseTakingService.addImages(patientId, type, imageUrls);

  return res.status(200).json(
    new ApiResponse(200, `${type === 'before' ? 'Before' : 'After'} images uploaded successfully`, caseTaking)
  );
});

module.exports = {
  getCaseTaking,
  upsertCaseTaking,
  uploadCaseImages,
};
