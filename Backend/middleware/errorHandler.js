const logger = require('../utils/logger');

function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.code = 'NOT_FOUND';
  res.status(404);
  next(error);
}

function errorHandler(err, req, res, next) {
  logger.error('request_failed', {
    method: req.method,
    path: req.originalUrl,
    message: err?.message || 'Unhandled error',
    code: err?.code || null,
  });

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err && err.name === 'MulterError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      code: err.code || 'UPLOAD_ERROR',
      name: err.name,
      ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    });
  }

  if (err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json({
    success: false,
    message: (err && err.message) || 'Server error',
    code: (err && err.code) || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
    ...(process.env.NODE_ENV !== 'production' ? { stack: err && err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
