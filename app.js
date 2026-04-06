const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const financeRoutes = require('./routes/finance');
const userRoutes = require('./routes/users');
const { AppError } = require('./utils/errors');

const app = express();

// Keep the app setup near the top so server.js can stay tiny.
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/users', userRoutes);

// Simple ping route for quick local checks.
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Anything that reaches here did not match a route above.
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Final error response formatter.
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Programming or unknown errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message, stack: err.stack })
  });
});

module.exports = app;
