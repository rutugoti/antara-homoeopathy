'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get all events, paginated, with optional search and active/inactive filter.
 * isPublished: "true" → active only, "false" → inactive only, undefined → all.
 */
const getAllEvents = async ({ page = 1, limit = 10, search, isPublished }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (isPublished !== undefined) {
    where.isPublished = isPublished === 'true' || isPublished === true;
  }

  if (search && search.trim() !== '') {
    where.OR = [
      { title:      { contains: search, mode: 'insensitive' } },
      { type:       { contains: search, mode: 'insensitive' } },
      { organizeBy: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Get a single event by id.
 */
const getEventById = async (id) => {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    throw new ApiError(404, `Event with id "${id}" not found.`);
  }

  return event;
};

/**
 * Create a new event.
 */
const createEvent = async (data) => {
  const { title, type, organizeBy, description, date, time, location, isPublished } = data;

  return prisma.event.create({
    data: {
      title,
      type:        type        ?? null,
      organizeBy:  organizeBy  ?? null,
      description: description ?? null,
      date:        new Date(date),
      time,
      location:    location    ?? null,
      isPublished: isPublished !== undefined ? isPublished : true,
    },
  });
};

/**
 * Update an existing event.
 */
const updateEvent = async (id, data) => {
  const { title, type, organizeBy, description, date, time, location, isPublished } = data;

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Event with id "${id}" not found.`);
  }

  const updateData = {};
  if (title       !== undefined) updateData.title       = title;
  if (type        !== undefined) updateData.type        = type;
  if (organizeBy  !== undefined) updateData.organizeBy  = organizeBy;
  if (description !== undefined) updateData.description = description;
  if (date        !== undefined) updateData.date        = new Date(date);
  if (time        !== undefined) updateData.time        = time;
  if (location    !== undefined) updateData.location    = location;
  if (isPublished !== undefined) updateData.isPublished = isPublished;

  return prisma.event.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Toggle event publish status.
 */
const togglePublish = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, isPublished: true },
  });

  if (!event) {
    throw new ApiError(404, `Event with id "${id}" not found.`);
  }

  return prisma.event.update({
    where: { id },
    data: { isPublished: !event.isPublished },
  });
};

/**
 * Delete an event.
 */
const deleteEvent = async (id) => {
  const existing = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Event with id "${id}" not found.`);
  }

  await prisma.event.delete({ where: { id } });
  return { message: 'Event deleted successfully.' };
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  togglePublish,
  deleteEvent,
};
