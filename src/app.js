const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const parsePdfRoute = require('./routes/Parsepdf.js'); // ✅ import upar

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', routes);
app.use('/api', parsePdfRoute); // ✅ 404 handler se PEHLE

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