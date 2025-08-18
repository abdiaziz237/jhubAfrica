// createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const name = 'Admin User';
    const email = 'admin@jhuba.africa';
    const password = 'admin1234'; // You can change this
    const role = 'admin';

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin user already exists');
      return mongoose.disconnect();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    console.log('✅ Admin user created:', user.email);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ Error creating admin:', err.message);
  });
