'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Auto-generate the next officeId: OFC-001, OFC-002, etc.
 */
const generateOfficeId = async () => {
  const latest = await prisma.clinic.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { officeId: true },
  });

  if (!latest) return 'OFC-001';

  const parts = latest.officeId.split('-');
  const next  = parseInt(parts[1], 10) + 1;
  return `OFC-${String(next).padStart(3, '0')}`;
};

/**
 * Get all clinics, paginated with search.
 */
const getAllClinics = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search && search.trim() !== '') {
    where.OR = [
      { title:      { contains: search, mode: 'insensitive' } },
      { address:    { contains: search, mode: 'insensitive' } },
      { contact:    { contains: search, mode: 'insensitive' } },
      { officeType: { contains: search, mode: 'insensitive' } },
      { location:   { contains: search, mode: 'insensitive' } },
      { officeId:   { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clinics, totalCount] = await Promise.all([
    prisma.clinic.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.clinic.count({ where }),
  ]);

  return {
    clinics,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Get a single clinic by id.
 */
const getClinicById = async (id) => {
  const clinic = await prisma.clinic.findUnique({ where: { id } });

  if (!clinic) {
    throw new ApiError(404, `Clinic with id "${id}" not found.`);
  }

  return clinic;
};

/**
 * Create a new clinic with auto-generated officeId.
 */
const createClinic = async (data) => {
  const { title, address, contact, officeType, location } = data;

  const officeId = await generateOfficeId();

  return prisma.clinic.create({
    data: {
      officeId,
      title,
      address:    address    ?? null,
      contact:    contact    ?? null,
      officeType: officeType ?? null,
      location:   location   ?? null,
    },
  });
};

/**
 * Update an existing clinic.
 */
const updateClinic = async (id, data) => {
  const { title, address, contact, officeType, location } = data;

  const existing = await prisma.clinic.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Clinic with id "${id}" not found.`);
  }

  const updateData = {};
  if (title      !== undefined) updateData.title      = title;
  if (address    !== undefined) updateData.address    = address;
  if (contact    !== undefined) updateData.contact    = contact;
  if (officeType !== undefined) updateData.officeType = officeType;
  if (location   !== undefined) updateData.location   = location;

  return prisma.clinic.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete a clinic.
 */
const deleteClinic = async (id) => {
  const existing = await prisma.clinic.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Clinic with id "${id}" not found.`);
  }

  await prisma.clinic.delete({ where: { id } });
  return { message: 'Clinic deleted successfully.' };
};

module.exports = {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
};
