'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Add minutes to a time string. Supports both '10:00 AM' and '10:00' (24-hour) formats.
 */
const addMinutesToTime = (timeStr, minutes) => {
  let hours, mins, period;
  
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);

  if (match12) {
    hours = parseInt(match12[1], 10);
    mins = parseInt(match12[2], 10);
    period = match12[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else if (match24) {
    hours = parseInt(match24[1], 10);
    mins = parseInt(match24[2], 10);
  } else {
    return null;
  }

  const totalMins = hours * 60 + mins + minutes;
  let newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;

  // Since time inputs typically use 24h format for values but display 12h, we should return 24h format so the frontend time radios match logic, or just return 12h format if we want AM/PM
  // The frontend slots list just displays this string. Let's return 12-hour format so it looks nice in the UI:
  const newPeriod = newHours >= 12 ? 'PM' : 'AM';
  let dispHours = newHours % 12;
  if (dispHours === 0) dispHours = 12;

  const hh = String(dispHours).padStart(2, '0');
  const mm = String(newMins).padStart(2, '0');
  return `${hh}:${mm} ${newPeriod}`;
};

/**
 * Get today's date range (start 00:00, end 23:59).
 */
const getDateRange = (dateStr) => {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Get all appointments for a given date, optionally filtered by branch.
 * Returns appointments sorted by time with patient details.
 */
const getAppointmentsByDate = async ({ date, branch }) => {
  if (!date) throw new ApiError(400, 'Date is required.');

  const { start, end } = getDateRange(date);

  const where = {
    date: { gte: start, lte: end },
  };
  if (branch) where.branch = branch;

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: {
        select: {
          id: true,
          fileId: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { time: 'asc' },
  });

  return appointments.map((appt) => ({
    ...appt,
    patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
    doctorName: appt.doctor ? appt.doctor.name : null,
    timeSlot: appt.endTime ? `${appt.time} To ${appt.endTime}` : appt.time,
  }));
};

/**
 * Create a new appointment with auto-computed endTime from settings.
 */
const createAppointment = async (data) => {
  const {
    patientId, date, time, branch, reason, notes,
    charge, appointmentBy, doctorId, isNewPatient,
  } = data;

  // Validate patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, firstName: true, lastName: true, fileId: true },
  });
  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  // Check for duplicate appointment on the same date
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  const dayEnd = new Date(appointmentDate);
  dayEnd.setHours(23, 59, 59, 999);

  const duplicate = await prisma.appointment.findFirst({
    where: {
      patientId,
      date: { gte: appointmentDate, lte: dayEnd },
      status: { notIn: ['CANCELLED'] },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ApiError(409, 'Patient already has an appointment on this date.');
  }

  // Auto-compute endTime from appointment settings
  let endTime = null;
  const settings = await prisma.appointmentSettings.findFirst();
  if (settings && time) {
    const duration = isNewPatient ? settings.newPatientTime : settings.oldPatientTime;
    endTime = addMinutesToTime(time, duration);
  }

  // Auto-assign charge from settings if not provided
  let appointmentCharge = charge !== undefined ? parseFloat(charge) : null;
  if (appointmentCharge === null && settings) {
    appointmentCharge = isNewPatient ? settings.newPatientFee : settings.oldPatientFee;
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      date:          appointmentDate,
      time,
      endTime:       endTime,
      branch:        branch        || 'MAIN',
      reason:        reason        || null,
      notes:         notes         || null,
      charge:        appointmentCharge,
      appointmentBy: appointmentBy || 'In Clinic',
      doctorId:      doctorId      || null,
      status:        'PENDING',
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true, fileId: true },
      },
    },
  });

  return {
    ...appointment,
    patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
    timeSlot: appointment.endTime
      ? `${appointment.time} To ${appointment.endTime}`
      : appointment.time,
  };
};

/**
 * Get a single appointment by id.
 */
const getAppointmentById = async (id) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          fileId: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          gender: true,
          dateOfBirth: true,
          age: true,
        },
      },
      doctor: {
        select: { id: true, name: true },
      },
    },
  });

  if (!appointment) {
    throw new ApiError(404, `Appointment with id "${id}" not found.`);
  }

  return appointment;
};

/**
 * Update an existing appointment.
 */
const updateAppointment = async (id, data) => {
  const { date, time, branch, reason, notes, charge, appointmentBy, doctorId } = data;

  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, `Appointment with id "${id}" not found.`);
  }

  const updateData = {};
  if (date          !== undefined) updateData.date          = new Date(date);
  if (time          !== undefined) updateData.time          = time;
  if (branch        !== undefined) updateData.branch        = branch;
  if (reason        !== undefined) updateData.reason        = reason;
  if (notes         !== undefined) updateData.notes         = notes;
  if (charge        !== undefined) updateData.charge        = parseFloat(charge);
  if (appointmentBy !== undefined) updateData.appointmentBy = appointmentBy;
  if (doctorId      !== undefined) updateData.doctorId      = doctorId;

  // Recompute endTime if time changed
  if (time !== undefined) {
    const settings = await prisma.appointmentSettings.findFirst();
    if (settings) {
      updateData.endTime = addMinutesToTime(time, settings.oldPatientTime);
    }
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      patient: {
        select: { firstName: true, lastName: true, fileId: true },
      },
    },
  });

  return updated;
};

/**
 * Update appointment status.
 */
const updateStatus = async (id, status) => {
  const validStatuses = ['PENDING', 'CONFIRMED', 'IN', 'CLOSED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status "${status}". Allowed: ${validStatuses.join(', ')}.`);
  }

  const existing = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { firstName: true, lastName: true, fileId: true } },
    },
  });
  if (!existing) {
    throw new ApiError(404, `Appointment with id "${id}" not found.`);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  return {
    id: updated.id,
    status: updated.status,
    patientName: `${existing.patient.firstName} ${existing.patient.lastName}`,
    fileId: existing.patient.fileId,
    time: updated.time,
    endTime: updated.endTime,
    branch: updated.branch,
  };
};

/**
 * Cancel an appointment.
 */
const cancelAppointment = async (id) => {
  return updateStatus(id, 'CANCELLED');
};

/**
 * Get available time slots for a given date and branch.
 * Computes slots from appointment settings and subtracts already-booked times.
 */
const getAvailableSlots = async ({ date, branch }) => {
  if (!date) throw new ApiError(400, 'Date is required.');

  const settings = await prisma.appointmentSettings.findFirst();
  if (!settings) {
    throw new ApiError(404, 'Appointment settings have not been configured yet.');
  }

  // Check if the day is a working day
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  if (!settings.workingDays.includes(dayOfWeek)) {
    return { slots: [], message: `${dayOfWeek} is not a working day.` };
  }

  // Check if it's a holiday
  const { start, end } = getDateRange(date);
  const holiday = await prisma.holiday.findFirst({
    where: { date: { gte: start, lte: end } },
  });

  if (holiday && !holiday.morningTime && !holiday.afternoonTime) {
    return { slots: [], message: `${holiday.title} — Full day holiday.` };
  }

  // Generate all possible slots from morning + afternoon ranges
  const generateSlots = (startTime, endTime, durationMins) => {
    const slots = [];
    let current = startTime;

    while (current) {
      const slotEnd = addMinutesToTime(current, durationMins);
      if (!slotEnd) break;

      // Compare times: if slotEnd exceeds endTime, stop
      const currentMins = timeToMinutes(current);
      const endMins = timeToMinutes(endTime);
      if (currentMins >= endMins) break;

      slots.push({ startTime: current, endTime: slotEnd });
      current = slotEnd;
    }
    return slots;
  };

  // Convert "HH:MM AM/PM" or "HH:MM" to total minutes for comparison
  const timeToMinutes = (timeStr) => {
    const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = parseInt(match12[2], 10);
      const p = match12[3].toUpperCase();
      if (p === 'PM' && h !== 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    } else if (match24) {
      return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
    }
    return 0;
  };

  const duration = settings.oldPatientTime; // default slot size
  const morningSlots   = generateSlots(settings.morningStartTime, settings.morningEndTime, duration);
  const afternoonSlots = generateSlots(settings.afternoonStartTime, settings.afternoonEndTime, duration);
  const allSlots = [...morningSlots, ...afternoonSlots];

  // Get booked appointments for that date
  const whereBooked = {
    date: { gte: start, lte: end },
    status: { notIn: ['CANCELLED'] },
  };
  if (branch) whereBooked.branch = branch;

  const booked = await prisma.appointment.findMany({
    where: whereBooked,
    select: { time: true },
  });

  const bookedTimes = new Set(booked.map((a) => a.time));

  const available = allSlots.map((slot) => ({
    ...slot,
    timeSlot: `${slot.startTime} To ${slot.endTime}`,
    isBooked: bookedTimes.has(slot.startTime),
  }));

  return { slots: available };
};

module.exports = {
  getAppointmentsByDate,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  updateStatus,
  cancelAppointment,
  getAvailableSlots,
};
