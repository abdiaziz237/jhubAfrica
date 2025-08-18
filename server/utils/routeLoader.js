const fs = require('fs');
const path = require('path');

const loadRoutes = (app) => {
  // API routes
  const routePath = path.join(__dirname, '../routes');
  
  fs.readdirSync(routePath).forEach(file => {
    if (file.endsWith('.js')) {
      try {
        const route = require(path.join(routePath, file));
        const routeName = file.split('.')[0];
        
        app.use(`/api/v1/${routeName}`, route);
        console.log(`Route /api/v1/${routeName} loaded`.blue);
      } catch (err) {
        console.error(`Error loading route ${file}:`, err);
        process.exit(1);
      }
    }
  });

  // Frontend routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
};

module.exports = loadRoutes;