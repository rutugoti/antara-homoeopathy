'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const bookingService            = require('../services/booking.service');

// ─── GET /api/book/lookup?fileId=AH-00123 ────────────────────────────────────
/**
 * Lookup an existing patient by their File ID.
 * Used in the "Old Patient" tab of the booking form.
 */
const lookupPatient = asyncHandler(async (req, res) => {
  const { fileId } = req.query;

  if (!fileId) {
    throw new ApiError(400, 'fileId query parameter is required.');
  }

  const patient = await bookingService.lookupPatientByFileId(fileId.toUpperCase());

  return res.status(200).json(
    new ApiResponse(200, 'Patient found', patient)
  );
});

// ─── POST /api/book/old-patient ───────────────────────────────────────────────
/**
 * Book appointment for an existing (old) patient.
 * Expects fileId to identify the patient, slot info, and payment details.
 */
const bookOldPatient = asyncHandler(async (req, res) => {
  const {
    fileId, date, time, branch, reason, notes,
    appointmentBy, doctorId,
    paymentAmount, paymentMethod, paymentNotes,
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!fileId) missing.push('fileId');
  if (!date)   missing.push('date');
  if (!time)   missing.push('time');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const result = await bookingService.bookForOldPatient({
    fileId: fileId.toUpperCase(), date, time, branch, reason, notes,
    appointmentBy, doctorId,
    paymentAmount, paymentMethod, paymentNotes,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Appointment booked successfully for existing patient', result)
  );
});

// ─── POST /api/book/new-patient ───────────────────────────────────────────────
/**
 * Register a new patient AND book their first appointment in one step.
 * Includes patient details, slot selection, and payment.
 */
const bookNewPatient = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, age,
    date, time, reason, notes, appointmentBy, doctorId,
    paymentAmount, paymentMethod, paymentNotes,
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!firstName) missing.push('firstName');
  if (!lastName)  missing.push('lastName');
  if (!phone)     missing.push('phone');
  if (!date)      missing.push('date');
  if (!time)      missing.push('time');
  if (!dateOfBirth && !age) missing.push('dateOfBirth or age');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const result = await bookingService.bookForNewPatient({
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, age,
    date, time, reason, notes, appointmentBy, doctorId,
    paymentAmount, paymentMethod, paymentNotes,
  });

  return res.status(201).json(
    new ApiResponse(201, 'New patient registered and appointment booked successfully', result)
  );
});

// ─── GET /api/book/payments/:patientId ────────────────────────────────────────
/**
 * Get payment history for a patient.
 */
const getPayments = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page  = parseInt(req.query.page,  10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await bookingService.getPaymentsByPatient(patientId, { page, limit });

  return res.status(200).json(
    new ApiResponse(200, 'Payment history fetched successfully', result)
  );
});

module.exports = {
  lookupPatient,
  bookOldPatient,
  bookNewPatient,
  getPayments,
};
