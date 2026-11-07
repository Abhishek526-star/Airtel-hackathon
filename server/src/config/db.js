const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/udyam_digital';
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Database] Connecting to MongoDB Atlas (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(mongoUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 45000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[Database Error] Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('[Database Error] All connection attempts failed. Exiting.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
