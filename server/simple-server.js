require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.static(path.join(__dirname, '../client/public')));

// Serve HTML templates
app.get('/templates/:template', (req, res) => {
  const templatePath = path.join(__dirname, '../client/public/templates', req.params.template);
  res.sendFile(templatePath);
});

// Simple route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Simple registration route
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  console.log('Registration attempt:', { name, email });
  
  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide name, email and password' 
    });
  }
  
  // Simulate successful registration
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { name, email }
  });
});

// Simple login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and password' 
    });
  }
  
  // Simulate successful login
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: { name: 'Test User', email, role: email.includes('admin') ? 'admin' : 'user' },
      token: 'test-jwt-token'
    }
  });
});

// Simple admin dashboard data route
app.get('/api/admin/dashboard', (req, res) => {
  console.log('Admin dashboard request');
  
  // Simulate admin dashboard data
  res.status(200).json({
    success: true,
    data: {
      stats: {
        users: 120,
        courses: 15,
        enrollments: 350,
        revenue: 25000
      },
      recentUsers: [
        { id: 1, name: 'John Doe', email: 'john@example.com', joinedAt: '2023-08-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinedAt: '2023-08-14' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', joinedAt: '2023-08-13' }
      ],
      recentCourses: [
        { id: 1, title: 'JavaScript Fundamentals', enrollments: 45, createdAt: '2023-07-10' },
        { id: 2, title: 'React Masterclass', enrollments: 32, createdAt: '2023-07-15' },
        { id: 3, title: 'Node.js Backend Development', enrollments: 28, createdAt: '2023-07-20' }
      ]
    }
  });
});

// Admin login route
app.post('/api/admin/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Admin login attempt:', { email });
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and password' 
    });
  }
  
  // Check if it's an admin email (simple check for demo)
  const isAdmin = email.includes('admin');
  if (!isAdmin) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
  
  // Simulate successful admin login
  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    token: 'admin-jwt-token',
    user: {
      id: 1,
      name: 'Admin User',
      email,
      role: 'admin'
    }
  });
});

// Admin users route
app.get('/api/admin/users', (req, res) => {
  console.log('Admin users request');
  
  // Simulate users data
  res.status(200).json([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', xp: 250 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', xp: 320 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', xp: 180 },
    { id: 4, name: 'Admin User', email: 'admin@example.com', role: 'admin', xp: 500 }
  ]);
});

// Admin courses route
app.get('/api/admin/courses', (req, res) => {
  console.log('Admin courses request');
  
  // Simulate courses data
  res.status(200).json([
    { id: 1, title: 'JavaScript Fundamentals', enrollments: 45, createdAt: '2023-07-10' },
    { id: 2, title: 'React Masterclass', enrollments: 32, createdAt: '2023-07-15' },
    { id: 3, title: 'Node.js Backend Development', enrollments: 28, createdAt: '2023-07-20' }
  ]);
});

// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});