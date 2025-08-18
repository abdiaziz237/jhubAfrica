const Joi = require('joi');

module.exports = {
  activityQuerySchema: Joi.object({
    days: Joi.number().min(1).max(30).default(7),
    type: Joi.string().valid('all', 'logins', 'actions')
  })
};