'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
/**
 * Master dashboard endpoint.
 * Runs all four data-fetching service calls in parallel and returns the
 * complete dashboard payload in a single response.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [summary, todaysAppointments, holidays, upcomingEvents] = await Promise.all([
    dashboardService.getDashboardSummary(),
    dashboardService.getTodaysAppointments(),
    dashboardService.getHolidays(),
    dashboardService.getUpcomingEvents(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, 'Dashboard data fetched successfully', {
      summary,
      todaysAppointments,
      holidays,
      upcomingEvents,
    })
  );
});

// ─── GET /api/dashboard/appointments/today ────────────────────────────────────
/**
 * Returns all appointments scheduled for the current day.
 */
const getTodaysAppointments = asyncHandler(async (req, res) => {
  const appointments = await dashboardService.getTodaysAppointments();

  return res.status(200).json(
    new ApiResponse(200, "Today's appointments fetched successfully", {
      count: appointments.length,
      appointments,
    })
  );
});

// ─── PATCH /api/dashboard/appointments/:id/status ────────────────────────────
/**
 * Updates the status of a single appointment.
 * Expects { status: "IN" | "CLOSED" | "CANCELLED" } in the request body.
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required in the request body.');
  }

  const updated = await dashboardService.updateAppointmentStatus(id, status.toUpperCase());

  return res.status(200).json(
    new ApiResponse(200, 'Appointment status updated successfully', updated)
  );
});

// ─── GET /api/dashboard/holidays ─────────────────────────────────────────────
/**
 * Returns all holidays ordered by date, with isPast flag and nulls replaced.
 */
const getHolidays = asyncHandler(async (req, res) => {
  const holidays = await dashboardService.getHolidays();

  return res.status(200).json(
    new ApiResponse(200, 'Holidays fetched successfully', {
      count: holidays.length,
      holidays,
    })
  );
});

// ─── GET /api/dashboard/events ───────────────────────────────────────────────
/**
 * Returns upcoming published events (max 10), from today onwards.
 */
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await dashboardService.getUpcomingEvents();

  return res.status(200).json(
    new ApiResponse(200, 'Upcoming events fetched successfully', {
      count: events.length,
      events,
    })
  );
});

module.exports = {
  getDashboard,
  getTodaysAppointments,
  updateAppointmentStatus,
  getHolidays,
  getUpcomingEvents,
};
