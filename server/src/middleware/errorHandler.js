const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid resource identifier: ${err.value}`,
      data: null,
      error: { code: 'INVALID_ID' },
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate entry: A record with this ${field} already exists.`,
      data: null,
      error: { code: 'DUPLICATE_KEY', field, value: err.keyValue[field] },
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      issue: val.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed on input data.',
      data: null,
      error: { code: 'VALIDATION_ERROR', details },
    });
  }

  // Handle Multer File Size Error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File upload exceeds the 5MB size limit.',
      data: null,
      error: { code: 'FILE_TOO_LARGE' },
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    data: null,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
    },
  });
};

module.exports = errorHandler;

