const Joi = require('joi');

module.exports = {
  // Email Verification
  verifyEmail: Joi.object({
    token: Joi.string().required()
  }),

  // Password Reset
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  })
};
