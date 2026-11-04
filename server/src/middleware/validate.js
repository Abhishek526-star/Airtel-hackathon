const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        issue: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Input validation failed. Please check the supplied fields.',
        data: null,
        error: { code: 'VALIDATION_ERROR', details },
      });
    }
    next(error);
  }
};

module.exports = validate;
