/**
 * Fix googleSub Index Migration Script
 * 
 * Problem: The googleSub field has a non-sparse unique index that prevents
 * multiple users from having null googleSub values (email/password registrations)
 * 
 * Solution: Drop the old index and create a new sparse unique index
 * 
 * Run: node scripts/fix-googleSub-index.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixGoogleSubIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('members');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Check if googleSub_1 index exists
    const googleSubIndex = indexes.find(idx => idx.name === 'googleSub_1');
    
    if (googleSubIndex) {
      console.log('\n🔧 Dropping old googleSub_1 index...');
      await collection.dropIndex('googleSub_1');
      console.log('✓ Old index dropped');
    } else {
      console.log('\n⚠️  googleSub_1 index not found');
    }

    // Create new sparse unique index
    console.log('\n🔧 Creating new sparse unique index for googleSub...');
    await collection.createIndex(
      { googleSub: 1 },
      { 
        unique: true, 
        sparse: true,
        name: 'googleSub_1'
      }
    );
    console.log('✓ New sparse index created');

    // Verify the new index
    const newIndexes = await collection.indexes();
    const newGoogleSubIndex = newIndexes.find(idx => idx.name === 'googleSub_1');
    
    console.log('\n✅ Verification:');
    console.log('  Index name:', newGoogleSubIndex.name);
    console.log('  Unique:', newGoogleSubIndex.unique);
    console.log('  Sparse:', newGoogleSubIndex.sparse);

    console.log('\n🎉 Migration completed successfully!');
    console.log('   You can now register multiple users with email/password.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

fixGoogleSubIndex();
