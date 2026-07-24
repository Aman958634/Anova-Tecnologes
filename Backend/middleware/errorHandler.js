function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(err, req, res, next) {
  console.error('[global:error] request failed', {
    method: req.method,
    path: req.originalUrl,
  });
  console.error(err);
  console.error(err && err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err && err.name === 'MulterError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
    });
  }

  if (err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json({
    success: false,
    message: (err && err.message) || 'Server error',
    stack: err && err.stack,
  });
}

module.exports = { notFound, errorHandler };
