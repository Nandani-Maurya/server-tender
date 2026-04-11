const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');

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
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    error: process.env.NODE_ENV === 'development' ? null : undefined
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

module.exports = app;
