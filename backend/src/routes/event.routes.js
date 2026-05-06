'use strict';

const { Router } = require('express');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  togglePublish,
  deleteEvent,
} = require('../controllers/event.controller');

// const { protect } = require('../middleware/auth.middleware');

const router = Router();

// ─── Event Routes ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/events
 * @desc    Get paginated list of events with optional search and active filter
 * @query   page, limit, search (by name/type/organizeBy), isPublished (true|false)
 * @access  Private
 */
// router.get('/', protect, getAllEvents);
router.get('/', getAllEvents);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @body    { title*, date*, time*, type?, organizeBy?, description?, location?, isPublished? }
 * @access  Private
 */
// router.post('/', protect, createEvent);
router.post('/', createEvent);

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event
 * @access  Private
 */
// router.get('/:id', protect, getEventById);
router.get('/:id', getEventById);

/**
 * @route   PATCH /api/events/:id
 * @desc    Update an event
 * @body    { title?, type?, organizeBy?, description?, date?, time?, location?, isPublished? }
 * @access  Private
 */
// router.patch('/:id', protect, updateEvent);
router.patch('/:id', updateEvent);

/**
 * @route   PATCH /api/events/:id/toggle-publish
 * @desc    Toggle event active/inactive status
 * @access  Private
 */
// router.patch('/:id/toggle-publish', protect, togglePublish);
router.patch('/:id/toggle-publish', togglePublish);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private
 */
// router.delete('/:id', protect, deleteEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
