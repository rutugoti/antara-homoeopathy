'use strict';

const asyncHandler              = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const eventService              = require('../services/event.service');

// ─── GET /api/events ──────────────────────────────────────────────────────────
const getAllEvents = asyncHandler(async (req, res) => {
  const page        = parseInt(req.query.page,  10) || 1;
  const limit       = parseInt(req.query.limit, 10) || 10;
  const search      = req.query.search      || undefined;
  const isPublished = req.query.isPublished  || undefined;

  const result = await eventService.getAllEvents({ page, limit, search, isPublished });

  return res.status(200).json(
    new ApiResponse(200, 'Events fetched successfully', result)
  );
});

// ─── GET /api/events/:id ─────────────────────────────────────────────────────
const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, 'Event fetched successfully', event)
  );
});

// ─── POST /api/events ────────────────────────────────────────────────────────
const createEvent = asyncHandler(async (req, res) => {
  const { title, type, organizeBy, description, date, time, location, isPublished } = req.body;

  const missing = [];
  if (!title) missing.push('title');
  if (!date)  missing.push('date');
  if (!time)  missing.push('time');

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'Missing required fields.',
      missing.map((f) => ({ field: f, message: `${f} is required.` }))
    );
  }

  const event = await eventService.createEvent({
    title, type, organizeBy, description, date, time, location, isPublished,
  });

  return res.status(201).json(
    new ApiResponse(201, 'Event created successfully', event)
  );
});

// ─── PATCH /api/events/:id ───────────────────────────────────────────────────
const updateEvent = asyncHandler(async (req, res) => {
  const updated = await eventService.updateEvent(req.params.id, req.body);

  return res.status(200).json(
    new ApiResponse(200, 'Event updated successfully', updated)
  );
});

// ─── PATCH /api/events/:id/toggle-publish ────────────────────────────────────
const togglePublish = asyncHandler(async (req, res) => {
  const event = await eventService.togglePublish(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, `Event ${event.isPublished ? 'published' : 'unpublished'} successfully`, event)
  );
});

// ─── DELETE /api/events/:id ──────────────────────────────────────────────────
const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  togglePublish,
  deleteEvent,
};
