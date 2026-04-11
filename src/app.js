const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const { errorResponse } = require('./utils/responseHandler');

const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  return errorResponse(res, err.message || 'Internal Server Error', statusCode, err);
});

module.exports = app;
