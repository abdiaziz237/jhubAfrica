const Joi = require('joi');

module.exports = {
  // Course Creation
  createCourse: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    instructor: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().min(0).required()
  }),

  // Course Update
  updateCourse: Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(10),
    instructor: Joi.string(),
    category: Joi.string(),
    price: Joi.number().min(0)
  }).min(1)
};