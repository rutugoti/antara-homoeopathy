'use strict';

const { Router } = require('express');
const {
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice,
} = require('../controllers/invoice.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router({ mergeParams: true });

// ─── Invoice Routes ──────────────────────────────────────────────────────────

/**
 * @route   GET /api/patients/:patientId/invoices
 * @desc    Get paginated invoice history for a patient
 * @query   page, limit
 * @access  Private
 */
// router.get('/', protect, getInvoices);
router.get('/', getInvoices);

/**
 * @route   POST /api/patients/:patientId/invoices
 * @desc    Create a new invoice (invoiceNo auto-generated)
 * @body    { diagnosis*, prescriptionDate, prescription*, amount }
 * @access  Private
 */
// router.post('/', protect, createInvoice);
router.post('/', createInvoice);

/**
 * @route   GET /api/patients/:patientId/invoices/:invoiceId
 * @desc    Get a single invoice with patient details (for printing)
 * @access  Private
 */
// router.get('/:invoiceId', protect, getInvoiceById);
router.get('/:invoiceId', getInvoiceById);

/**
 * @route   DELETE /api/patients/:patientId/invoices/:invoiceId
 * @desc    Delete an invoice
 * @access  Private
 */
// router.delete('/:invoiceId', protect, deleteInvoice);
router.delete('/:invoiceId', deleteInvoice);

module.exports = router;
