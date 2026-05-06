'use strict';

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { ApiError, ApiResponse } = require('./utils/apiResponse');
const dashboardRouter   = require('./routes/dashboard.routes');
const patientRouter     = require('./routes/patient.routes');
const caseTakingRouter  = require('./routes/caseTaking.routes');
const followUpRouter    = require('./routes/followUp.routes');
const invoiceRouter     = require('./routes/invoice.routes');
const settingsRouter    = require('./routes/appointmentSettings.routes');
const appointmentRouter = require('./routes/appointment.routes');
const bookRouter        = require('./routes/book.routes');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── Logging ──────────────────────────────────────────────────────────────────
// Use concise "dev" format locally; structured "combined" in production.
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRouter);
app.use('/api/patients',  patientRouter);
app.use('/api/patients/:patientId/case-taking',  caseTakingRouter);
app.use('/api/patients/:patientId/follow-ups',   followUpRouter);
app.use('/api/patients/:patientId/invoices',     invoiceRouter);
app.use('/api/settings',                          settingsRouter);
app.use('/api/appointments',                       appointmentRouter);
app.use('/api/book',                                bookRouter);

// Health-check — useful for load balancers and uptime monitors.
app.get('/api/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, 'Antara Homoeopathy API is up and running 🌿', {
      timestamp: new Date().toISOString(),
    })
  );
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be defined AFTER all routes and other middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const payload = {
    success: false,
    message,
    errors: err.errors || [],
  };

  // Expose stack trace only in development to avoid leaking internals.
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
});

module.exports = app;
