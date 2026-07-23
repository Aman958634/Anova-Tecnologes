function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err && err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(statusCode).json({ message: 'Image is too large. Max allowed size is 5MB.' });
    }
    return res.status(statusCode).json({ message: 'Invalid upload payload. Please upload one valid image file.' });
  }

  if (err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

module.exports = { notFound, errorHandler };
