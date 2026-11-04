const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const PORT = env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[Udyam Digital Server] Running in ${env.NODE_ENV} mode`);
      console.log(`[API Server URL] http://localhost:${PORT}`);
      console.log(`[Health Check]   http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection] ${err.message}`);
      // Keep server alive in dev
    });
  } catch (error) {
    console.error(`[Startup Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();
