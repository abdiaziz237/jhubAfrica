const { validationResult } = require('express-validator');
const { logSecurityEvent } = require('../utils/securityLogger');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = {};
    errors.array().forEach(err => {
      extractedErrors[err.param] = err.msg;
    });

    logSecurityEvent('VALIDATION_FAILED', {
      path: req.path,
      errors: extractedErrors,
      body: req.body
    });

    return res.status(422).json({
      success: false,
      errors: extractedErrors
    });
  };
};

// Joi validation middleware for admin routes
const validateJoi = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path[0]] = detail.message;
      });

      logSecurityEvent('JOI_VALIDATION_FAILED', {
        path: req.path,
        errors,
        body: req.body
      });

      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('Validation error:', err);
  
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
    
    logSecurityEvent('MONGOOSE_VALIDATION_FAILED', {
      path: req.path,
      errors
    });
    
    return res.status(422).json({
      success: false,
      errors
    });
  }
  
  next(err);
};

module.exports = {
  validate,
  validateJoi,
  errorHandler
};