const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'client/public');
const componentsDir = path.join(__dirname, 'client/src/components');

// List of HTML files to convert
const htmlFiles = [
  'login.html', 'register.html', 'dashboard.html', 'admin.html',
  'courses.html', 'profile.html', 'referrals.html', 'settings.html', 'admin-login.html'
];

htmlFiles.forEach(file => {
  const htmlContent = fs.readFileSync(path.join(publicDir, file), 'utf8');
  
  // Extract just the body content
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : htmlContent;
  
  // Remove scripts and links that will be handled by React
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<link[^>]+>/gi, '');
  
  // Create component name from file name
  const componentName = file.split('.')[0]
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  // Create JSX content
  const jsxContent = `
import React from 'react';
import './${componentName}.css';

const ${componentName} = () => {
  return (
    <div>
      ${content}
    </div>
  );
};

export default ${componentName};
  `;
  
  // Create component directory if it doesn't exist
  const componentDir = path.join(componentsDir, componentName);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  // Write component file
  fs.writeFileSync(path.join(componentDir, `${componentName}.js`), jsxContent.trim());
  
  // Create empty CSS file
  fs.writeFileSync(path.join(componentDir, `${componentName}.css`), '');
  
  console.log(`Converted ${file} to ${componentName} component`);
});