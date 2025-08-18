const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  
  // Add static file exceptions
  app.use('/assets', createProxyMiddleware({
    target: 'http://localhost:3000', // Frontend itself
    changeOrigin: true,
  }));
};