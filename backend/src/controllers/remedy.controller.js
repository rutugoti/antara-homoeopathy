'use strict';

const remedyService = require('../services/remedy.service');
const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * @desc    Add a new remedy for a patient
 * @route   POST /api/patients/:id/remedies
 */
const addRemedy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const remedy = await remedyService.createRemedy(id, req.body);
  
  return res.status(201).json(
    new ApiResponse(201, 'Remedy added successfully', remedy)
  );
});

/**
 * @desc    Get remedy history for a patient
 * @route   GET /api/patients/:id/remedy-history
 */
const getHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req.query;
  
  const history = await remedyService.getRemedyHistory(id, { 
    page: parseInt(page) || 1, 
    limit: parseInt(limit) || 10 
  });
  
  return res.status(200).json(
    new ApiResponse(200, 'Remedy history fetched successfully', history)
  );
});

module.exports = {
  addRemedy,
  getHistory,
};
