const express = require('express');
const router = express.Router();
const fs = require('fs');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

// @desc    Upload a single image, get back its permanent or local URL
// @route   POST /api/upload
// @access  Private (any logged-in member can upload — e.g. for profile photo, blog covers, gallery)
router.post(
  '/',
  protect,
  (req, res, next) => {
    // Support 'image', 'photo', or 'file' field names in multipart/form-data
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        res.status(400);
        return next(new Error(err.message || 'File upload failed'));
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      const file =
        (req.files?.image && req.files.image[0]) ||
        (req.files?.photo && req.files.photo[0]) ||
        (req.files?.file && req.files.file[0]) ||
        req.file;

      if (!file) {
        res.status(400);
        throw new Error('No image file provided');
      }

      // If Cloudinary is configured (e.g. on Render with env keys), upload permanently to Cloudinary
      if (isCloudinaryConfigured()) {
        try {
          const result = await uploadToCloudinary(file.path, {
            folder: 'shanan_gibe_union',
          });

          // Clean up local temp file after cloud upload
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (cleanupErr) {
            console.warn('Could not delete temp file:', cleanupErr.message);
          }

          return res.status(201).json({
            success: true,
            imageUrl: result.secure_url,
            url: result.secure_url,
            public_id: result.public_id,
            storage: 'cloudinary',
          });
        } catch (cloudErr) {
          console.error('Cloudinary upload error, falling back to local storage:', cloudErr.message);
          // Graceful fallback to local storage
        }
      }

      // Fallback: Local storage path (for local dev or if cloud keys are not set yet)
      const imageUrl = `/uploads/${file.filename}`;
      return res.status(201).json({
        success: true,
        imageUrl,
        url: imageUrl,
        filename: file.filename,
        storage: 'local',
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
