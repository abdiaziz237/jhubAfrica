const Joi = require('joi');

module.exports = {
  maintenanceSchema: Joi.object({
    status: Joi.boolean().required(),
    message: Joi.string().when('status', {
      is: true,
      then: Joi.string().required()
    })
  })
};