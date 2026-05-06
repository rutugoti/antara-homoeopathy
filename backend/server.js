'use strict';

require('dotenv').config();

const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLINIC_NAME = 'Antara Homoeopathy';

const startServer = async () => {
  // Verify database connectivity before accepting traffic.
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log(`🌿  ${CLINIC_NAME} — Patient Management System`);
    console.log(`🚀  Server running at : http://localhost:${PORT}`);
    console.log(`🌍  Environment       : ${NODE_ENV}`);
    console.log(`📡  API base URL      : http://localhost:${PORT}/api`);
    console.log(`❤️   Health check      : http://localhost:${PORT}/api/health`);
    console.log('');
  });
};

startServer();
