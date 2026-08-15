const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload a single image, get back its URL
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
  (req, res) => {
    const file =
      (req.files?.image && req.files.image[0]) ||
      (req.files?.photo && req.files.photo[0]) ||
      (req.files?.file && req.files.file[0]) ||
      req.file;

    if (!file) {
      res.status(400);
      throw new Error('No image file provided');
    }

    const imageUrl = `/uploads/${file.filename}`;
    res.status(201).json({
      success: true,
      imageUrl,
      url: imageUrl,
      filename: file.filename,
    });
  }
);

module.exports = router;
