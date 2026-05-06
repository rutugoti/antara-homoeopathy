'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get all follow-ups for a patient, ordered by most recent first.
 * Supports pagination.
 */
const getFollowUps = async (patientId, { page = 1, limit = 10 }) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const skip = (page - 1) * limit;

  const [followUps, totalCount] = await Promise.all([
    prisma.followUp.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.followUp.count({ where: { patientId } }),
  ]);

  return {
    followUps,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Create a new follow-up entry for a patient.
 */
const createFollowUp = async (patientId, data) => {
  const {
    followUp, weight, bp, appointmentCharge,
    historyTakenBy, remedy, dosage, repetition,
    potency, days, prescriptionType,
  } = data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, firstName: true, lastName: true, fileId: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const entry = await prisma.followUp.create({
    data: {
      patientId,
      followUp,
      weight:            weight            ?? null,
      bp:                bp                ?? null,
      appointmentCharge: appointmentCharge ? parseFloat(appointmentCharge) : null,
      historyTakenBy,
      remedy,
      dosage:            dosage            ?? null,
      repetition:        repetition        ?? null,
      potency,
      days:              days              ?? null,
      prescriptionType:  prescriptionType  ?? null,
    },
  });

  return entry;
};

/**
 * Get the remedy history for a patient (extracted from follow-ups).
 * Returns remedy, potency, and created date — paginated.
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

  const [remedies, totalCount] = await Promise.all([
    prisma.followUp.findMany({
      where: { patientId },
      select: {
        id:        true,
        remedy:    true,
        potency:   true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.followUp.count({ where: { patientId } }),
  ]);

  return {
    remedies,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

module.exports = {
  getFollowUps,
  createFollowUp,
  getRemedyHistory,
};
