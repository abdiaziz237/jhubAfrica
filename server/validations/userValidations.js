const Joi = require('joi');

// User Registration Schema
const registerUser = Joi.object({
  firstName: Joi.string().min(2).max(25).required()
    .pattern(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: Joi.string().min(2).max(25).required()
    .pattern(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'instructor', 'student', 'user').default('student'),
  phone: Joi.string().optional()
});

// User Update Schema
const updateUser = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid('admin', 'instructor', 'student'),
  password: Joi.string().min(8).optional()
}).min(1);

// List Users Schema
const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  role: Joi.string().valid('admin', 'instructor', 'student', '').optional()
});

// Get User Schema
const getUserSchema = Joi.object({
  userId: Joi.string().hex().length(24).required() // Assuming MongoDB ObjectId
});

// Delete User Schema
const deleteUserSchema = Joi.object({
  userId: Joi.string().hex().length(24).required() // Assuming MongoDB ObjectId
});

module.exports = {
  registerUser,
  updateUser,
  listUsersSchema,
  getUserSchema,
  deleteUserSchema
};
const loginUser = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});