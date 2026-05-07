'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Auto-generates the next fileId by inspecting the latest patient record.
 * Format: AH-XXXXX (zero-padded to 5 digits).
 *
 * @returns {Promise<string>} e.g. "AH-00124"
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
 * Paginated list of active patients with optional search and branch filter.
 */
const getAllPatients = async ({ page = 1, limit = 10, search, branch }) => {
  const skip = (page - 1) * limit;

  const where = { isActive: true };
  if (branch) where.branch = branch;

  if (search && search.trim() !== '') {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { email:     { contains: search, mode: 'insensitive' } },
      { phone:     { contains: search, mode: 'insensitive' } },
      { fileId:    { contains: search, mode: 'insensitive' } },
    ];
  }

  const [patients, totalCount] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:            true,
        fileId:        true,
        firstName:     true,
        lastName:      true,
        email:         true,
        phone:         true,
        bloodGroup:    true,
        branch:        true,
        gender:        true,
        maritalStatus: true,
        occupation:    true,
        profileImage:  true,
        createdAt:     true,
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    patients,
    totalCount,
    totalPages:  Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Fetch a single patient by id with their last 5 appointments and prescriptions.
 */
const getPatientById = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        select: {
          id:     true,
          date:   true,
          time:   true,
          status: true,
          branch: true,
          reason: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
      },
      prescriptions: {
        select: {
          id:        true,
          title:     true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${id}" not found.`);
  }

  return patient;
};

/**
 * Create a new patient record with an auto-generated fileId.
 */
const createPatient = async (data) => {
  const {
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, profileImage, note, age,
  } = data;

  const existing = await prisma.patient.findFirst({
    where: { phone, isActive: true },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, 'Phone number already registered.');
  }

  const fileId = await generateFileId();

  const patient = await prisma.patient.create({
    data: {
      fileId,
      firstName,
      lastName,
      gender,
      dateOfBirth:   dateOfBirth ? new Date(dateOfBirth) : (age ? new Date(new Date().getFullYear() - parseInt(age, 10), 0, 1) : new Date()),
      phone,
      email:         email         ?? null,
      address:       address       ?? null,
      bloodGroup:    bloodGroup    ?? null,
      branch:        branch        ?? 'MAIN',
      occupation:    occupation    ?? null,
      reference:     reference     ?? null,
      maritalStatus: maritalStatus ?? null,
      education:     education     ?? null,
      profileImage:  profileImage  ?? null,
      note:          note          ?? null,
      age:           age           ?? null,
    },
  });

  return patient;
};

/**
 * Update an existing patient's details (partial update).
 */
const updatePatient = async (id, data) => {
  const {
    firstName, lastName, gender, dateOfBirth, phone, email,
    address, bloodGroup, branch, occupation, reference,
    maritalStatus, education, profileImage, note, age,
  } = data;

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true, phone: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${id}" not found.`);
  }

  if (phone && phone !== patient.phone) {
    const phoneTaken = await prisma.patient.findFirst({
      where: { phone, isActive: true, NOT: { id } },
      select: { id: true },
    });
    if (phoneTaken) {
      throw new ApiError(409, 'Phone number already registered to another patient.');
    }
  }

  const updateData = {};
  if (firstName     !== undefined) updateData.firstName     = firstName;
  if (lastName      !== undefined) updateData.lastName      = lastName;
  if (gender        !== undefined) updateData.gender        = gender;
  if (dateOfBirth   !== undefined) updateData.dateOfBirth   = dateOfBirth ? new Date(dateOfBirth) : null;
  if (phone         !== undefined) updateData.phone         = phone;
  if (email         !== undefined) updateData.email         = email;
  if (address       !== undefined) updateData.address       = address;
  if (bloodGroup    !== undefined) updateData.bloodGroup    = bloodGroup;
  if (branch        !== undefined) updateData.branch        = branch;
  if (occupation    !== undefined) updateData.occupation    = occupation;
  if (reference     !== undefined) updateData.reference     = reference;
  if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
  if (education     !== undefined) updateData.education     = education;
  if (profileImage  !== undefined) updateData.profileImage  = profileImage;
  if (note          !== undefined) updateData.note          = note;
  if (age           !== undefined) updateData.age           = age;

  const updated = await prisma.patient.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

/**
 * Soft-delete a patient by setting isActive = false.
 */
const deletePatient = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${id}" not found.`);
  }

  await prisma.patient.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: 'Patient deleted successfully.' };
};

/**
 * Book a new PENDING appointment for a patient.
 */
const bookAppointmentForPatient = async (patientId, data) => {
  const { date, time, branch, reason, doctorId } = data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, fileId: true, firstName: true, lastName: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  const dayEnd = new Date(appointmentDate);
  dayEnd.setHours(23, 59, 59, 999);

  const duplicate = await prisma.appointment.findFirst({
    where: {
      patientId,
      status: 'PENDING',
      date:   { gte: appointmentDate, lte: dayEnd },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ApiError(409, 'Patient already has an appointment on this date.');
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      date:     appointmentDate,
      time,
      branch:   branch   ?? 'MAIN',
      reason:   reason   ?? null,
      doctorId: doctorId ?? null,
      status:   'PENDING',
    },
  });

  return {
    ...appointment,
    patientName: `${patient.firstName} ${patient.lastName}`,
    fileId:      patient.fileId,
  };
};

module.exports = {
  generateFileId,
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  bookAppointmentForPatient,
};
