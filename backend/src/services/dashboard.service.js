'use strict';

const { prisma } = require('../config/database');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the start (00:00:00.000) and end (23:59:59.999) of today in UTC
 * normalised to midnight so Prisma's @db.Date comparisons work correctly.
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/** Valid statuses an appointment can be moved TO via the dashboard. */
const UPDATABLE_STATUSES = ['IN', 'CLOSED', 'CANCELLED'];

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetch all appointments scheduled for today, enriched with patient details.
 *
 * @returns {Promise<Array>} Mapped appointment objects.
 */
const getTodaysAppointments = async () => {
  const { start, end } = getTodayRange();

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      patient: {
        select: {
          fileId: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
    orderBy: {
      time: 'asc',
    },
  });

  return appointments.map((appt) => ({
    appointmentId: appt.id,
    patientId: appt.patientId,
    patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
    fileId: appt.patient.fileId,
    phone: appt.patient.phone,
    time: appt.time,
    branch: appt.branch,
    status: appt.status,
    reason: appt.reason ?? null,
  }));
};

/**
 * Move an appointment to a new status.
 *
 * @param {string} appointmentId
 * @param {string} status - Must be one of IN | CLOSED | CANCELLED
 * @returns {Promise<Object>} Updated appointment summary.
 */
const updateAppointmentStatus = async (appointmentId, status) => {
  if (!UPDATABLE_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status "${status}". Allowed values: ${UPDATABLE_STATUSES.join(', ')}.`
    );
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: {
        select: {
          fileId: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error(`Appointment with id "${appointmentId}" not found.`);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      patient: {
        select: {
          fileId: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    appointmentId: updated.id,
    status: updated.status,
    patientName: `${updated.patient.firstName} ${updated.patient.lastName}`,
    fileId: updated.patient.fileId,
    time: updated.time,
    branch: updated.branch,
  };
};

/**
 * Retrieve all holidays ordered chronologically.
 * Null timing values are replaced with the string "Closed".
 *
 * @returns {Promise<Array>} Mapped holiday objects.
 */
const getHolidays = async () => {
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: 'asc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return holidays.map((h) => ({
    id: h.id,
    title: h.title,
    date: h.date,
    morningTime: h.morningTime ?? 'Closed',
    afternoonTime: h.afternoonTime ?? 'Closed',
    isPast: h.date < today,
  }));
};

/**
 * Retrieve published events from today onwards (max 10).
 *
 * @returns {Promise<Array>} Mapped event objects.
 */
const getUpcomingEvents = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      date: { gte: today },
    },
    orderBy: { date: 'asc' },
    take: 10,
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    location: e.location ?? null,
    description: e.description ?? null,
  }));
};

/**
 * Aggregate all dashboard summary counts in a single parallel query burst.
 *
 * @returns {Promise<Object>} Dashboard summary object.
 */
const getDashboardSummary = async () => {
  const { start, end } = getTodayRange();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    todayTotal,
    todayPending,
    todayIn,
    todayClosed,
    todayCancelled,
    upcomingEventsCount,
    upcomingHolidaysCount,
  ] = await Promise.all([
    // Active patient count
    prisma.patient.count({ where: { isActive: true } }),

    // Today's appointment totals
    prisma.appointment.count({ where: { date: { gte: start, lte: end } } }),
    prisma.appointment.count({ where: { date: { gte: start, lte: end }, status: 'PENDING' } }),
    prisma.appointment.count({ where: { date: { gte: start, lte: end }, status: 'IN' } }),
    prisma.appointment.count({ where: { date: { gte: start, lte: end }, status: 'CLOSED' } }),
    prisma.appointment.count({ where: { date: { gte: start, lte: end }, status: 'CANCELLED' } }),

    // Upcoming published events from today
    prisma.event.count({ where: { isPublished: true, date: { gte: today } } }),

    // Upcoming (future) holidays
    prisma.holiday.count({ where: { date: { gte: today } } }),
  ]);

  return {
    totalPatients,
    todaysAppointments: {
      total: todayTotal,
      pending: todayPending,
      in: todayIn,
      closed: todayClosed,
      cancelled: todayCancelled,
    },
    upcomingEventsCount,
    upcomingHolidaysCount,
  };
};

module.exports = {
  getTodaysAppointments,
  updateAppointmentStatus,
  getHolidays,
  getUpcomingEvents,
  getDashboardSummary,
};
