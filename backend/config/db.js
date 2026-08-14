const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/shanan_gibe_union';

  // 1. Try Primary URI (Atlas or custom)
  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 6000 });
      console.log(`✓ MongoDB connected successfully to: ${conn.connection.host}`);
      return;
    } catch (primaryErr) {
      console.warn(`\n⚠️  Primary MongoDB Connection Failed: ${primaryErr.message}`);
      if (primaryUri.includes('mongodb+srv://') || primaryUri.includes('mongodb.net')) {
        console.warn(`👉 Note on MongoDB Atlas: Make sure your current IP address is whitelisted in Atlas Network Access:`);
        console.warn(`   MongoDB Atlas Dashboard -> Network Access -> Add IP Address -> 'Allow Access from Anywhere' (0.0.0.0/0) or 'Add Current IP'.\n`);
      }
    }
  }

  // 2. Fallback to Local MongoDB
  try {
    console.log(`Attempting fallback to local MongoDB (${localUri})...`);
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`✓ Local MongoDB connected successfully: ${conn.connection.host}`);
  } catch (localErr) {
    console.error(`\n❌ Could not connect to either MongoDB Atlas or Local MongoDB.`);
    console.error(`   Local MongoDB Error: ${localErr.message}`);
    console.error(`\nTo fix MongoDB:`);
    console.error(`1. For MongoDB Atlas: Go to https://cloud.mongodb.com -> Network Access -> Add IP Address (0.0.0.0/0).`);
    console.error(`2. For Local MongoDB: Run 'brew services start mongodb-community' in your terminal.\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
