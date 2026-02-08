// Custom ErrorResponse class that extends Error
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ErrorResponse';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler wrapper to eliminate try-catch blocks in controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('❌ Error:', err);

  let error = { ...err };
  error.message = err.message;

  // If error is already an ErrorResponse instance, use it directly
  if (err instanceof ErrorResponse) {
    error = err;
  }
  // Mongoose bad ObjectId (CastError)
  else if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  // Mongoose duplicate key error (code 11000)
  else if (err.code === 11000) {
    // Extract the field name from the error
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field] || 'value';
    const message = `Duplicate ${field} value entered. Please use another value.`;
    error = new ErrorResponse(message, 400);
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = new ErrorResponse(message, 400);
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ErrorResponse(message, 401);
  }
  else if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new ErrorResponse(message, 401);
  }
  // For other errors, create a generic ErrorResponse if needed
  else {
    error = new ErrorResponse(err.message || 'Server Error', err.statusCode || 500);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export {
  ErrorResponse,
  asyncHandler,
  errorHandler,
  notFound
};

