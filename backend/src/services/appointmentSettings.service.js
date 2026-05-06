'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

// ─── Appointment Slot & Fee Settings (singleton) ──────────────────────────────

/**
 * Get the current appointment settings.
 * Returns null if no settings have been saved yet.
 */
const getSettings = async () => {
  const settings = await prisma.appointmentSettings.findFirst();
  return settings;
};

/**
 * Create or update appointment settings (upsert).
 * Only one record should ever exist — the first one found is updated.
 */
const upsertSettings = async (data) => {
  const {
    morningStartTime, morningEndTime,
    afternoonStartTime, afternoonEndTime,
    oldPatientTime, newPatientTime,
    oldPatientFee, newPatientFee,
  } = data;

  const existing = await prisma.appointmentSettings.findFirst();

  if (existing) {
    const updateData = {};
    if (morningStartTime   !== undefined) updateData.morningStartTime   = morningStartTime;
    if (morningEndTime     !== undefined) updateData.morningEndTime     = morningEndTime;
    if (afternoonStartTime !== undefined) updateData.afternoonStartTime = afternoonStartTime;
    if (afternoonEndTime   !== undefined) updateData.afternoonEndTime   = afternoonEndTime;
    if (oldPatientTime     !== undefined) updateData.oldPatientTime     = parseInt(oldPatientTime, 10);
    if (newPatientTime     !== undefined) updateData.newPatientTime     = parseInt(newPatientTime, 10);
    if (oldPatientFee      !== undefined) updateData.oldPatientFee      = parseFloat(oldPatientFee);
    if (newPatientFee      !== undefined) updateData.newPatientFee      = parseFloat(newPatientFee);

    return prisma.appointmentSettings.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  return prisma.appointmentSettings.create({
    data: {
      morningStartTime:   morningStartTime   || '09:00 AM',
      morningEndTime:     morningEndTime     || '02:00 PM',
      afternoonStartTime: afternoonStartTime || '02:01 PM',
      afternoonEndTime:   afternoonEndTime   || '11:59 PM',
      oldPatientTime:     oldPatientTime     ? parseInt(oldPatientTime, 10)  : 10,
      newPatientTime:     newPatientTime     ? parseInt(newPatientTime, 10)  : 90,
      oldPatientFee:      oldPatientFee      ? parseFloat(oldPatientFee)     : 500,
      newPatientFee:      newPatientFee      ? parseFloat(newPatientFee)     : 1000,
      workingDays:        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  });
};

// ─── Day Settings ─────────────────────────────────────────────────────────────

/**
 * Update the working days array.
 * @param {string[]} workingDays - e.g. ["Monday", "Tuesday", "Wednesday"]
 */
const updateWorkingDays = async (workingDays) => {
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const invalid = workingDays.filter((d) => !validDays.includes(d));

  if (invalid.length > 0) {
    throw new ApiError(400, `Invalid day(s): ${invalid.join(', ')}. Allowed: ${validDays.join(', ')}.`);
  }

  const existing = await prisma.appointmentSettings.findFirst();

  if (!existing) {
    // Create a default settings record with the provided working days
    return prisma.appointmentSettings.create({
      data: {
        morningStartTime:   '09:00 AM',
        morningEndTime:     '02:00 PM',
        afternoonStartTime: '02:01 PM',
        afternoonEndTime:   '11:59 PM',
        oldPatientTime:     10,
        newPatientTime:     90,
        oldPatientFee:      500,
        newPatientFee:      1000,
        workingDays,
      },
    });
  }

  return prisma.appointmentSettings.update({
    where: { id: existing.id },
    data: { workingDays },
  });
};

// ─── Holiday CRUD ─────────────────────────────────────────────────────────────

/**
 * Get all holidays, paginated, with optional type filter.
 * type: "all" | "upcoming" | "past"
 */
const getHolidays = async ({ page = 1, limit = 10, type = 'all' }) => {
  const skip = (page - 1) * limit;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where = {};
  if (type === 'upcoming') where.date = { gte: today };
  if (type === 'past')     where.date = { lt: today };

  const [holidays, totalCount] = await Promise.all([
    prisma.holiday.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.holiday.count({ where }),
  ]);

  return {
    holidays: holidays.map((h) => ({
      ...h,
      isPast: h.date < today,
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Create a new holiday.
 * morningTime / afternoonTime are null for full-day holidays,
 * or a string like "09:00 AM - 12:00 PM" for partial working hours.
 */
const createHoliday = async (data) => {
  const { title, date, morningTime, afternoonTime } = data;

  const holiday = await prisma.holiday.create({
    data: {
      title,
      date:          new Date(date),
      morningTime:   morningTime   || null,
      afternoonTime: afternoonTime || null,
    },
  });

  return holiday;
};

/**
 * Update an existing holiday.
 */
const updateHoliday = async (id, data) => {
  const { title, date, morningTime, afternoonTime } = data;

  const existing = await prisma.holiday.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, `Holiday with id "${id}" not found.`);
  }

  const updateData = {};
  if (title         !== undefined) updateData.title         = title;
  if (date          !== undefined) updateData.date          = new Date(date);
  if (morningTime   !== undefined) updateData.morningTime   = morningTime || null;
  if (afternoonTime !== undefined) updateData.afternoonTime = afternoonTime || null;

  return prisma.holiday.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete a holiday by id.
 */
const deleteHoliday = async (id) => {
  const existing = await prisma.holiday.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, `Holiday with id "${id}" not found.`);
  }

  await prisma.holiday.delete({ where: { id } });
  return { message: 'Holiday deleted successfully.' };
};

module.exports = {
  getSettings,
  upsertSettings,
  updateWorkingDays,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};
