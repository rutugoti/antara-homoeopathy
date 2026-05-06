'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Add minutes to a time string (e.g. "10:00 AM" + 10 → "10:10 AM").
 */
const addMinutesToTime = (timeStr, minutes) => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const totalMins = hours * 60 + mins + minutes;
  let newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;

  const newPeriod = newHours >= 12 ? 'PM' : 'AM';
  if (newHours === 0) newHours = 12;
  else if (newHours > 12) newHours -= 12;

  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')} ${newPeriod}`;
};

/**
 * Auto-generate receipt number: REC-00001, REC-00002, etc.
 */
const generateReceiptNo = async () => {
  const latest = await prisma.payment.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { receiptNo: true },
  });

  if (!latest || !latest.receiptNo) return 'REC-00001';

  const parts = latest.receiptNo.split('-');
  const next  = parseInt(parts[1], 10) + 1;
  return `REC-${String(next).padStart(5, '0')}`;
};

/**
 * Auto-generate patient fileId.
 */
const generateFileId = async () => {
  const latest = await prisma.patient.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { fileId: true },
  });

  if (!latest) return 'AH-00001';

  const parts = latest.fileId.split('-');
  const next  = parseInt(parts[1], 10) + 1;
  return `AH-${String(next).padStart(5, '0')}`;
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Lookup an existing patient by fileId (for the "old patient" flow).
 * Returns basic patient info or throws 404.
 */
const lookupPatientByFileId = async (fileId) => {
  const patient = await prisma.patient.findUnique({
    where: { fileId },
    select: {
      id:           true,
      fileId:       true,
      firstName:    true,
      lastName:     true,
      phone:        true,
      email:        true,
      gender:       true,
      dateOfBirth:  true,
      age:          true,
      branch:       true,
      profileImage: true,
    },
  });

  if (!patient) {
    throw new ApiError(404, `No patient found with File ID "${fileId}".`);
  }

  return patient;
};

/**
 * Book appointment for an EXISTING (old) patient.
 *
 * Flow: validate patient → check duplicate → get settings → create appointment → create payment
 */
const bookForOldPatient = async (data) => {
  const {
    fileId, date, time, branch, reason, notes,
    appointmentBy, doctorId,
    paymentAmount, paymentMethod, paymentNotes,
  } = data;

  // 1. Find patient by fileId
  const patient = await prisma.patient.findUnique({
    where: { fileId },
    select: { id: true, firstName: true, lastName: true, fileId: true },
  });

  if (!patient) {
    throw new ApiError(404, `No patient found with File ID "${fileId}".`);
  }

  // 2. Check for duplicate on same date
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentDate);
  dayEnd.setHours(23, 59, 59, 999);

  const duplicate = await prisma.appointment.findFirst({
    where: {
      patientId: patient.id,
      date: { gte: appointmentDate, lte: dayEnd },
      status: { notIn: ['CANCELLED'] },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ApiError(409, 'Patient already has an appointment on this date.');
  }

  // 3. Get settings for fee + slot duration (old patient)
  const settings = await prisma.appointmentSettings.findFirst();
  const duration = settings ? settings.oldPatientTime : 10;
  const fee      = settings ? settings.oldPatientFee  : 500;
  const endTime  = time ? addMinutesToTime(time, duration) : null;
  const charge   = paymentAmount !== undefined ? parseFloat(paymentAmount) : fee;

  // 4. Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId:    patient.id,
      date:         appointmentDate,
      time,
      endTime,
      branch:       branch        || 'MAIN',
      reason:       reason        || null,
      notes:        notes         || null,
      charge,
      appointmentBy: appointmentBy || 'In Clinic',
      doctorId:     doctorId      || null,
      status:       'CONFIRMED',
    },
  });

  // 5. Create payment
  const receiptNo = await generateReceiptNo();
  const payment = await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      patientId:     patient.id,
      amount:        charge,
      method:        paymentMethod || 'CASH',
      status:        'PAID',
      notes:         paymentNotes  || null,
      receiptNo,
    },
  });

  return {
    appointment: {
      ...appointment,
      timeSlot: endTime ? `${time} To ${endTime}` : time,
    },
    payment,
    patient: {
      id:      patient.id,
      fileId:  patient.fileId,
      name:    `${patient.firstName} ${patient.lastName}`,
    },
  };
};

/**
 * Book appointment for a NEW patient.
 *
 * Flow: create patient → create appointment → create payment
 */
const bookForNewPatient = async (data) => {
  const {
    // Patient fields
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, age,
    // Appointment fields
    date, time, reason, notes, appointmentBy, doctorId,
    // Payment fields
    paymentAmount, paymentMethod, paymentNotes,
  } = data;

  // 1. Check duplicate phone
  const existingPhone = await prisma.patient.findFirst({
    where: { phone, isActive: true },
    select: { id: true },
  });

  if (existingPhone) {
    throw new ApiError(409, 'Phone number already registered. Use "Old Patient" flow instead.');
  }

  // 2. Create patient
  const fileId = await generateFileId();

  const patient = await prisma.patient.create({
    data: {
      fileId,
      firstName,
      lastName,
      gender,
      dateOfBirth:   new Date(dateOfBirth),
      phone,
      email:         email         ?? null,
      address:       address       ?? null,
      bloodGroup:    bloodGroup    ?? null,
      branch:        branch        ?? 'MAIN',
      occupation:    occupation    ?? null,
      reference:     reference     ?? null,
      maritalStatus: maritalStatus ?? null,
      education:     education     ?? null,
      age:           age           ? parseInt(age, 10) : null,
    },
  });

  // 3. Get settings for fee + slot duration (new patient)
  const settings = await prisma.appointmentSettings.findFirst();
  const duration = settings ? settings.newPatientTime : 90;
  const fee      = settings ? settings.newPatientFee  : 1000;
  const endTime  = time ? addMinutesToTime(time, duration) : null;
  const charge   = paymentAmount !== undefined ? parseFloat(paymentAmount) : fee;

  // 4. Create appointment
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      patientId:     patient.id,
      date:          appointmentDate,
      time,
      endTime,
      branch:        branch        || 'MAIN',
      reason:        reason        || null,
      notes:         notes         || null,
      charge,
      appointmentBy: appointmentBy || 'In Clinic',
      doctorId:      doctorId      || null,
      status:        'CONFIRMED',
    },
  });

  // 5. Create payment
  const receiptNo = await generateReceiptNo();
  const payment = await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      patientId:     patient.id,
      amount:        charge,
      method:        paymentMethod || 'CASH',
      status:        'PAID',
      notes:         paymentNotes  || null,
      receiptNo,
    },
  });

  return {
    patient: {
      id:     patient.id,
      fileId: patient.fileId,
      name:   `${patient.firstName} ${patient.lastName}`,
    },
    appointment: {
      ...appointment,
      timeSlot: endTime ? `${time} To ${endTime}` : time,
    },
    payment,
  };
};

/**
 * Get payment history for a patient.
 */
const getPaymentsByPatient = async (patientId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        appointment: {
          select: { date: true, time: true, endTime: true, branch: true },
        },
      },
    }),
    prisma.payment.count({ where: { patientId } }),
  ]);

  return {
    payments,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

module.exports = {
  lookupPatientByFileId,
  bookForOldPatient,
  bookForNewPatient,
  getPaymentsByPatient,
};
