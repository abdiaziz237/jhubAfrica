// controllers/index.js

// Import full controllers (each one has its own file)
const userController = require('./userController');
const courseController = require('./courseController');
const dashboardController = require('./dashboardController');
const adminController = require('./adminController');
// const systemController = require('./systemController'); // optional if you keep separate

module.exports = {
  userController,
  courseController,
  dashboardController,
  adminController,
  // systemController
};
