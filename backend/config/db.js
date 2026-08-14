const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim().replace(/^"|"$/g, '');
  const localUri = 'mongodb://127.0.0.1:27017/shanan_gibe_union';

  // 1. Try Primary URI (Atlas or custom)
  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 6000 });
      console.log(`✓ MongoDB connected successfully to: ${conn.connection.host}`);
      return;
    } catch (primaryErr) {
      console.warn(`\n⚠️  Primary MongoDB Connection Failed: ${primaryErr.message}`);

      if (primaryErr.message.includes('authentication failed') || primaryErr.message.includes('bad auth')) {
        console.warn(`\n🔑 Authentication Failed on MongoDB Atlas:`);
        console.warn(`   This means the Database User password in MongoDB Atlas does not match the URI in backend/.env.`);
        console.warn(`   To fix in 30 seconds:`);
        console.warn(`   1. Go to https://cloud.mongodb.com -> Select your project -> Click "Database Access" (left menu).`);
        console.warn(`   2. Find user "fuadsabseb690_db_user" -> Click "Edit" -> Click "Edit Password".`);
        console.warn(`   3. Enter a simple alphanumeric password (e.g. FuadUnion2026).`);
        console.warn(`   4. Update your backend/.env file with the new password:`);
        console.warn(`      MONGODB_URI=mongodb+srv://fuadsabseb690_db_user:FuadUnion2026@cluster0.m8hnjni.mongodb.net/shanan_gibe_union?retryWrites=true&w=majority`);
      }

      if (primaryUri.includes('mongodb+srv://') || primaryUri.includes('mongodb.net')) {
        console.warn(`\n🌐 IP Whitelist Check:`);
        console.warn(`   MongoDB Atlas Dashboard -> Network Access -> Add IP Address -> 'Allow Access from Anywhere' (0.0.0.0/0).\n`);
      }
    }
  }

  // 2. Fallback to Local MongoDB
  try {
    console.log(`Attempting fallback to local MongoDB (${localUri})...`);
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`✓ Local MongoDB connected successfully: ${conn.connection.host}`);
  } catch (localErr) {
    console.error(`\n❌ Could not connect to MongoDB Atlas or Local MongoDB.`);
    console.error(`   Local MongoDB Error: ${localErr.message}`);
    console.error(`\nTo get MongoDB connected:`);
    console.error(`Option A (Atlas Cloud): Reset password in Atlas -> Database Access -> update backend/.env.`);
    console.error(`Option B (Local Mac): Run 'brew services start mongodb-community' in your terminal.\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
