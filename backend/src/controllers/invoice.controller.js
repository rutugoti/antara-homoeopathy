'use strict';

const asyncHandler          = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const invoiceService        = require('../services/invoice.service');

// ─── GET /api/patients/:patientId/invoices ────────────────────────────────────
const getInvoices = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await invoiceService.getInvoices(patientId, { page, limit });

  return res.status(200).json(
    new ApiResponse(200, 'Invoices fetched successfully', result)
  );
});

// ─── POST /api/patients/:patientId/invoices ───────────────────────────────────
const createInvoice = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { diagnosis, prescriptionDate, prescription, amount } = req.body;

  const missing = [];
  if (!diagnosis)    missing.push('diagnosis');
  if (!prescription) missing.push('prescription');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const invoice = await invoiceService.createInvoice(patientId, {
    diagnosis,
    prescriptionDate: prescriptionDate || new Date().toISOString().split('T')[0],
    prescription,
    amount,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Invoice created successfully', invoice)
  );
});

// ─── GET /api/patients/:patientId/invoices/:invoiceId ─────────────────────────
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);

  return res.status(200).json(
    new ApiResponse(200, 'Invoice fetched successfully', invoice)
  );
});

// ─── DELETE /api/patients/:patientId/invoices/:invoiceId ──────────────────────
const deleteInvoice = asyncHandler(async (req, res) => {
  const result = await invoiceService.deleteInvoice(req.params.invoiceId);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

module.exports = {
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice,
};
