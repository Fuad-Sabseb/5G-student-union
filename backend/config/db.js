const mongoose = require('mongoose');

let retryTimeout = null;

const connectDB = async () => {
  const primaryUri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim().replace(/^"|"$/g, '');
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
  const localUri = 'mongodb://127.0.0.1:27017/shanan_gibe_union';

  // Clear any existing retry timer
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }

  // 1. Attempt Primary URI (Atlas or custom URI)
  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 8000,
        retryWrites: true,
        w: 'majority',
      });
      console.log(`✓ MongoDB connected successfully to: ${conn.connection.host}`);
      return;
    } catch (primaryErr) {
      console.warn(`\n⚠️  Primary MongoDB Connection Failed: ${primaryErr.message}`);

      if (primaryErr.message.includes('authentication failed') || primaryErr.message.includes('bad auth')) {
        console.warn(`🔑 Authentication Error: Check that the Atlas username & password in your MONGODB_URI are correct.`);
      }

      if (primaryUri.includes('mongodb+srv://') || primaryUri.includes('mongodb.net')) {
        console.warn(`🌐 Atlas Network Access: Make sure IP 0.0.0.0/0 is allowed in Atlas Network Access.`);
      }
    }
  }

  // 2. Fallback to Local MongoDB ONLY in Development (Never in Production/Render)
  if (!isProduction) {
    try {
      console.log(`Attempting fallback to local MongoDB (${localUri})...`);
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 4000 });
      console.log(`✓ Local MongoDB connected successfully: ${conn.connection.host}`);
      return;
    } catch (localErr) {
      console.warn(`⚠️  Local MongoDB not available: ${localErr.message}`);
    }
  }

  // 3. Graceful Background Retry (NEVER call process.exit(1) to avoid killing Render / Web Hosts)
  console.warn(`\n⏳ Database disconnected. The server will stay online and retry connecting in 10 seconds...`);
  retryTimeout = setTimeout(() => {
    connectDB();
  }, 10000);
};

// Monitor ongoing connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected.');
});

module.exports = connectDB;
