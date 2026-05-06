'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get all prescriptions, paginated, with optional search by title and list.
 */
const getAllPrescriptions = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search && search.trim() !== '') {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { list:  { contains: search, mode: 'insensitive' } },
    ];
  }

  const [prescriptions, totalCount] = await Promise.all([
    prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        title:     true,
        list:      true,
        createdAt: true,
        patient: {
          select: {
            id:        true,
            fileId:    true,
            firstName: true,
            lastName:  true,
          },
        },
      },
    }),
    prisma.prescription.count({ where }),
  ]);

  return {
    prescriptions,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Get prescriptions for a specific patient.
 */
const getPrescriptionsByPatient = async (patientId, { page = 1, limit = 10, search }) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const skip = (page - 1) * limit;
  const where = { patientId };

  if (search && search.trim() !== '') {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { list:  { contains: search, mode: 'insensitive' } },
    ];
  }

  const [prescriptions, totalCount] = await Promise.all([
    prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        title:     true,
        list:      true,
        content:   true,
        createdAt: true,
      },
    }),
    prisma.prescription.count({ where }),
  ]);

  return {
    prescriptions,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Get a single prescription by id.
 */
const getPrescriptionById = async (id) => {
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id:        true,
          fileId:    true,
          firstName: true,
          lastName:  true,
          phone:     true,
          email:     true,
          age:       true,
          gender:    true,
        },
      },
    },
  });

  if (!prescription) {
    throw new ApiError(404, `Prescription with id "${id}" not found.`);
  }

  return prescription;
};

/**
 * Create a new prescription.
 */
const createPrescription = async (data) => {
  const { patientId, title, list, content } = data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, firstName: true, lastName: true, fileId: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const prescription = await prisma.prescription.create({
    data: {
      patientId,
      title,
      list:    list    ?? null,
      content: content ?? '',
    },
  });

  return {
    ...prescription,
    patientName: `${patient.firstName} ${patient.lastName}`,
    fileId: patient.fileId,
  };
};

/**
 * Update an existing prescription.
 */
const updatePrescription = async (id, data) => {
  const { title, list, content } = data;

  const existing = await prisma.prescription.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Prescription with id "${id}" not found.`);
  }

  const updateData = {};
  if (title   !== undefined) updateData.title   = title;
  if (list    !== undefined) updateData.list     = list;
  if (content !== undefined) updateData.content  = content;

  const updated = await prisma.prescription.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

/**
 * Delete a prescription.
 */
const deletePrescription = async (id) => {
  const existing = await prisma.prescription.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Prescription with id "${id}" not found.`);
  }

  await prisma.prescription.delete({ where: { id } });

  return { message: 'Prescription deleted successfully.' };
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionsByPatient,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
};
