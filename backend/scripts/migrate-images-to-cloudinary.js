/**
 * Migration Script: Upload Local Images to Cloudinary and Update Database
 * 
 * This script:
 * 1. Connects to MongoDB Atlas
 * 2. Finds all gallery items with local image paths (/uploads/...)
 * 3. Checks if the local file exists
 * 4. Uploads the file to Cloudinary
 * 5. Updates the database record with the new Cloudinary URL
 * 6. Creates a backup of original data before updating
 * 
 * Usage:
 *   node backend/scripts/migrate-images-to-cloudinary.js
 * 
 * Prerequisites:
 *   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET must be set in .env
 *   - Local image files must exist in backend/uploads/
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const GalleryItem = require('../models/GalleryItem');
const Announcement = require('../models/Announcement');
const BlogPost = require('../models/BlogPost');
const Member = require('../models/Member');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const BACKUP_FILE = path.join(__dirname, 'image-migration-backup.json');

// Statistics
const stats = {
  gallery: { total: 0, migrated: 0, failed: 0, skipped: 0 },
  announcements: { total: 0, migrated: 0, failed: 0, skipped: 0 },
  blog: { total: 0, migrated: 0, failed: 0, skipped: 0 },
  members: { total: 0, migrated: 0, failed: 0, skipped: 0 },
};

const backupData = {
  gallery: [],
  announcements: [],
  blog: [],
  members: [],
  timestamp: new Date().toISOString(),
};

// Helper: Check if URL is a local path
function isLocalPath(url) {
  return url && url.startsWith('/uploads/');
}

// Helper: Get local file path from URL
function getLocalFilePath(url) {
  const filename = url.replace('/uploads/', '');
  return path.join(UPLOADS_DIR, filename);
}

// Helper: Upload image and return Cloudinary URL
async function uploadImageToCloudinary(localPath, itemId, collection) {
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠️  File not found: ${localPath}`);
    return null;
  }

  try {
    const result = await uploadToCloudinary(localPath, {
      folder: `shanan_gibe_union/${collection}`,
      public_id: itemId, // Use database ID for consistent naming
    });

    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error(`  ❌ Upload failed: ${error.message}`);
    return null;
  }
}

// Migrate Gallery Items
async function migrateGalleryItems() {
  console.log('\n📸 Migrating Gallery Items...');
  const items = await GalleryItem.find({ imageUrl: /^\/uploads\// });
  stats.gallery.total = items.length;

  for (const item of items) {
    console.log(`\nProcessing: ${item._id} - ${item.imageUrl}`);

    // Backup original data
    backupData.gallery.push({
      _id: item._id,
      imageUrl: item.imageUrl,
      caption_en: item.caption_en,
      caption_or: item.caption_or,
      album: item.album,
    });

    const localPath = getLocalFilePath(item.imageUrl);
    const result = await uploadImageToCloudinary(localPath, item._id.toString(), 'gallery');

    if (result) {
      item.imageUrl = result.url;
      await item.save();
      stats.gallery.migrated++;
    } else {
      stats.gallery.failed++;
    }
  }
}

// Migrate Announcement Images
async function migrateAnnouncements() {
  console.log('\n📢 Migrating Announcement Images...');
  const announcements = await Announcement.find({ imageUrl: /^\/uploads\// });
  stats.announcements.total = announcements.length;

  for (const announcement of announcements) {
    console.log(`\nProcessing: ${announcement._id} - ${announcement.imageUrl}`);

    // Backup original data
    backupData.announcements.push({
      _id: announcement._id,
      imageUrl: announcement.imageUrl,
      title_en: announcement.title_en,
      title_or: announcement.title_or,
    });

    const localPath = getLocalFilePath(announcement.imageUrl);
    const result = await uploadImageToCloudinary(localPath, announcement._id.toString(), 'announcements');

    if (result) {
      announcement.imageUrl = result.url;
      await announcement.save();
      stats.announcements.migrated++;
    } else {
      stats.announcements.failed++;
    }
  }
}

// Migrate Blog Post Cover Images
async function migrateBlogPosts() {
  console.log('\n📝 Migrating Blog Cover Images...');
  const posts = await BlogPost.find({ coverImageUrl: /^\/uploads\// });
  stats.blog.total = posts.length;

  for (const post of posts) {
    console.log(`\nProcessing: ${post._id} - ${post.coverImageUrl}`);

    // Backup original data
    backupData.blog.push({
      _id: post._id,
      coverImageUrl: post.coverImageUrl,
      title: post.title,
    });

    const localPath = getLocalFilePath(post.coverImageUrl);
    const result = await uploadImageToCloudinary(localPath, post._id.toString(), 'blog');

    if (result) {
      post.coverImageUrl = result.url;
      await post.save();
      stats.blog.migrated++;
    } else {
      stats.blog.failed++;
    }
  }
}

// Migrate Profile Pictures
async function migrateProfilePictures() {
  console.log('\n👤 Migrating Profile Pictures...');
  const members = await Member.find({ profileImageUrl: /^\/uploads\// });
  stats.members.total = members.length;

  for (const member of members) {
    console.log(`\nProcessing: ${member._id} - ${member.profileImageUrl}`);

    // Backup original data
    backupData.members.push({
      _id: member._id,
      profileImageUrl: member.profileImageUrl,
      fullName: member.fullName,
    });

    const localPath = getLocalFilePath(member.profileImageUrl);
    const result = await uploadImageToCloudinary(localPath, member._id.toString(), 'profiles');

    if (result) {
      member.profileImageUrl = result.url;
      await member.save();
      stats.members.migrated++;
    } else {
      stats.members.failed++;
    }
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Image Migration to Cloudinary\n');
  console.log('============================================');

  // Check Cloudinary configuration
  if (!isCloudinaryConfigured()) {
    console.error('❌ Cloudinary is not configured!');
    console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    process.exit(1);
  }

  console.log('✅ Cloudinary configured');
  console.log(`📁 Local uploads directory: ${UPLOADS_DIR}`);

  // Check if uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`❌ Uploads directory not found: ${UPLOADS_DIR}`);
    console.error('No local images available for migration.');
    process.exit(1);
  }

  // List available files
  const localFiles = fs.readdirSync(UPLOADS_DIR);
  console.log(`📊 Found ${localFiles.length} local files\n`);

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Run migrations
    await migrateGalleryItems();
    await migrateAnnouncements();
    await migrateBlogPosts();
    await migrateProfilePictures();

    // Save backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));
    console.log(`\n💾 Backup saved: ${BACKUP_FILE}`);

    // Print summary
    console.log('\n============================================');
    console.log('📊 Migration Summary:');
    console.log('============================================');
    console.log(`Gallery Items:     ${stats.gallery.migrated}/${stats.gallery.total} migrated, ${stats.gallery.failed} failed`);
    console.log(`Announcements:     ${stats.announcements.migrated}/${stats.announcements.total} migrated, ${stats.announcements.failed} failed`);
    console.log(`Blog Posts:        ${stats.blog.migrated}/${stats.blog.total} migrated, ${stats.blog.failed} failed`);
    console.log(`Profile Pictures:  ${stats.members.migrated}/${stats.members.total} migrated, ${stats.members.failed} failed`);
    console.log('============================================');

    const totalMigrated = stats.gallery.migrated + stats.announcements.migrated + stats.blog.migrated + stats.members.migrated;
    const totalFailed = stats.gallery.failed + stats.announcements.failed + stats.blog.failed + stats.members.failed;

    if (totalFailed === 0) {
      console.log(`\n✅ Migration completed successfully! ${totalMigrated} images migrated.`);
    } else {
      console.log(`\n⚠️  Migration completed with ${totalFailed} failures.`);
      console.log('Check the logs above for details on failed uploads.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
}

// Run migration
runMigration().catch(console.error);
