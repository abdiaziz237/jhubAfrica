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
  errorHandler
};