const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    // Clean connection using latest mongoose defaults
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,  // 10s timeout
      socketTimeoutMS: 45000,           // 45s timeout for idle sockets
      maxPoolSize: 10,                  // max DB connections in pool
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline
      );
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`.red.bold);

    // Don't kill the server if DB is unavailable
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Server running without database connection'.yellow);
    }
  }
};

// Extra event listeners for mongoose connection state
mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔗 Mongoose connected to DB'.green.bold);
  }
});

mongoose.connection.on('error', (err) => {
  console.log(`💥 Mongoose connection error: ${err.message}`.red.bold);
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Mongoose disconnected'.yellow.bold);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔌 Mongoose connection closed due to app termination'.yellow);
  }
  process.exit(0);
});

module.exports = connectDB;
