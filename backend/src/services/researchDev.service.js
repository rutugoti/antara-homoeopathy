'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get all R&D entries, paginated with optional search by title.
 */
const getAllResearchDev = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search && search.trim() !== '') {
    where.OR = [
      { title:            { contains: search, mode: 'insensitive' } },
      { descriptionTitle: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [entries, totalCount] = await Promise.all([
    prisma.researchDev.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.researchDev.count({ where }),
  ]);

  return {
    entries,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Get a single R&D entry by id.
 */
const getResearchDevById = async (id) => {
  const entry = await prisma.researchDev.findUnique({ where: { id } });

  if (!entry) {
    throw new ApiError(404, `R&D entry with id "${id}" not found.`);
  }

  return entry;
};

/**
 * Create a new R&D entry.
 */
const createResearchDev = async (data) => {
  const { title, descriptionTitle, description, image } = data;

  return prisma.researchDev.create({
    data: {
      title,
      descriptionTitle: descriptionTitle ?? null,
      description:      description      ?? null,
      image:            image            ?? null,
    },
  });
};

/**
 * Update an existing R&D entry.
 */
const updateResearchDev = async (id, data) => {
  const { title, descriptionTitle, description, image } = data;

  const existing = await prisma.researchDev.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `R&D entry with id "${id}" not found.`);
  }

  const updateData = {};
  if (title            !== undefined) updateData.title            = title;
  if (descriptionTitle !== undefined) updateData.descriptionTitle = descriptionTitle;
  if (description      !== undefined) updateData.description      = description;
  if (image            !== undefined) updateData.image            = image;

  return prisma.researchDev.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete an R&D entry.
 */
const deleteResearchDev = async (id) => {
  const existing = await prisma.researchDev.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `R&D entry with id "${id}" not found.`);
  }

  await prisma.researchDev.delete({ where: { id } });
  return { message: 'R&D entry deleted successfully.' };
};

module.exports = {
  getAllResearchDev,
  getResearchDevById,
  createResearchDev,
  updateResearchDev,
  deleteResearchDev,
};
