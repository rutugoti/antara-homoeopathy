'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get the case taking record for a patient.
 * Returns null if none exists yet (frontend shows empty state).
 */
const getCaseTaking = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const caseTaking = await prisma.caseTaking.findUnique({
    where: { patientId },
    include: {
      patient: {
        select: {
          id: true,
          fileId: true,
          firstName: true,
          lastName: true,
          gender: true,
          dateOfBirth: true,
          phone: true,
          email: true,
          address: true,
          bloodGroup: true,
          occupation: true,
          reference: true,
          maritalStatus: true,
          education: true,
          age: true,
          branch: true,
        },
      },
    },
  });

  return caseTaking;
};

/**
 * Create or update the case taking record for a patient (upsert).
 * Since it's a 1:1 relation, we upsert so the doctor can keep editing.
 */
const upsertCaseTaking = async (patientId, data) => {
  const { historyTakenBy, beforeImages, afterImages, notes } = data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const caseTaking = await prisma.caseTaking.upsert({
    where: { patientId },
    create: {
      patientId,
      historyTakenBy: historyTakenBy ?? null,
      beforeImages:   beforeImages   ?? [],
      afterImages:    afterImages    ?? [],
      notes:          notes          ?? null,
    },
    update: {
      historyTakenBy: historyTakenBy !== undefined ? historyTakenBy : undefined,
      beforeImages:   beforeImages   !== undefined ? beforeImages   : undefined,
      afterImages:    afterImages    !== undefined ? afterImages    : undefined,
      notes:          notes          !== undefined ? notes          : undefined,
    },
  });

  return caseTaking;
};

/**
 * Add images (before or after) to a case taking record.
 * Appends to the existing array rather than replacing.
 */
const addImages = async (patientId, type, imageUrls) => {
  if (!['before', 'after'].includes(type)) {
    throw new ApiError(400, 'Image type must be "before" or "after".');
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  // Ensure a case taking record exists
  let caseTaking = await prisma.caseTaking.findUnique({
    where: { patientId },
  });

  if (!caseTaking) {
    caseTaking = await prisma.caseTaking.create({
      data: { patientId, beforeImages: [], afterImages: [] },
    });
  }

  const field = type === 'before' ? 'beforeImages' : 'afterImages';
  const existingImages = caseTaking[field] || [];
  const updatedImages = [...existingImages, ...imageUrls];

  const updated = await prisma.caseTaking.update({
    where: { patientId },
    data: { [field]: updatedImages },
  });

  return updated;
};

module.exports = {
  getCaseTaking,
  upsertCaseTaking,
  addImages,
};
