// // utils/routeLoader.js
// const fs = require('fs');
// const path = require('path');

// function loadRoutes(app) {
//   const routesPath = path.join(__dirname, '../routes');

//   fs.readdirSync(routesPath).forEach((file) => {
//     if (file.endsWith('.js')) {
//       const route = require(path.join(routesPath, file));

//       let routeName = file.replace('.js', '');

//       // Map filenames → correct API prefixes
//       const routeMap = {
//         admin: '/api/v1/admin',
//         auth: '/api/v1/auth',
//         course: '/api/v1/courses',
//         referral: '/api/v1/referrals'
//       };

//       const basePath = routeMap[routeName] || `/api/v1/${routeName}`;

//       app.use(basePath, route);
//       console.log(`✅ Route ${basePath} loaded`);
//     }
//   });
// }

// module.exports = loadRoutes;

// utils/routeLoader.js
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  const routesPath = path.join(__dirname, '../routes');
  const routeFiles = fs.readdirSync(routesPath);

  routeFiles.forEach((file) => {
    if (file.endsWith('.js')) {
      const route = require(path.join(routesPath, file));
      const routeName = file.replace('.js', '');

      let basePath = `/api/v1/${routeName.replace('Routes', '')}`;
      // Special cases for naming consistency
      if (routeName === 'course') basePath = '/api/v1/courses';
      if (routeName === 'admin') basePath = '/api/v1/admin';
      if (routeName === 'auth') basePath = '/api/v1/auth';
      if (routeName === 'dashboard') basePath = '/api/v1/dashboard';
      if (routeName === 'referralRoutes') basePath = '/api/v1/referrals';

      app.use(basePath, route);
      console.log(`Route ${basePath} loaded`);
    }
  });
};

