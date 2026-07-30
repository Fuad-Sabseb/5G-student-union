const asyncHandler = require('express-async-handler');
const GalleryItem = require('../models/GalleryItem');

// @desc    Add a gallery image
// @route   POST /api/gallery
// @access  Private/Exec+Admin
const createGalleryItem = asyncHandler(async (req, res) => {
  const { imageUrl, caption_en, caption_or, album } = req.body;

  if (!imageUrl) {
    res.status(400);
    throw new Error('imageUrl is required (upload the image first via /api/upload)');
  }

  const item = await GalleryItem.create({
    imageUrl,
    caption_en,
    caption_or,
    album,
    uploadedBy: req.member._id,
  });

  res.status(201).json(item);
});

// @desc    Get all gallery images (optionally filter by album)
// @route   GET /api/gallery?album=...
// @access  Public
const getGalleryItems = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.album) filter.album = req.query.album;

  const items = await GalleryItem.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Gallery item not found');
  }
  await item.deleteOne();
  res.json({ message: 'Gallery item removed' });
});

module.exports = { createGalleryItem, getGalleryItems, deleteGalleryItem };
