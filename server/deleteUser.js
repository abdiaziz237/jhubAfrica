const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteOne({ email: "sizuumoha458@gmail.com" });
  console.log("User deleted");
  mongoose.disconnect();
});