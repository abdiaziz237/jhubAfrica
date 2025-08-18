// validations/index.js
module.exports = {
  ...require('./userValidations'),
  ...require('./courseValidations'),
  ...require('./authValidations'),
  ...require('./dashboardValidations'),
  ...require('./systemValidations')
};