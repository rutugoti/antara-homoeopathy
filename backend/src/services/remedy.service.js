'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Add a new remedy record for a patient.
 */
const createRemedy = async (patientId, data) => {
  const { remedy, potency, dosage, repetition, days, notes } = data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const entry = await prisma.remedy.create({
    data: {
      patientId,
      remedy,
      potency,
      dosage:     dosage     ?? null,
      repetition: repetition ?? null,
      days:       days       ?? null,
      notes:      notes      ?? null,
    },
  });

  return entry;
};

/**
 * Get remedy history for a patient.
 * Returns a combined list of remedies from both FollowUp and Remedy models.
 */
const getRemedyHistory = async (patientId, { page = 1, limit = 10 }) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const skip = (page - 1) * limit;

  // We fetch from both models and combine them
  const [followUpRemedies, dedicatedRemedies] = await Promise.all([
    prisma.followUp.findMany({
      where: { patientId },
      select: {
        id:         true,
        remedy:     true,
        potency:    true,
        dosage:     true,
        repetition: true,
        days:       true,
        createdAt:  true,
      },
    }),
    prisma.remedy.findMany({
      where: { patientId },
      select: {
        id:         true,
        remedy:     true,
        potency:    true,
        dosage:     true,
        repetition: true,
        days:       true,
        createdAt:  true,
      },
    }),
  ]);

  // Combine and sort by date descending
  const combined = [...followUpRemedies, ...dedicatedRemedies].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalCount = combined.length;
  const paginated = combined.slice(skip, skip + limit);

  return {
    remedies: paginated,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

module.exports = {
  createRemedy,
  getRemedyHistory,
};
