const express = require('express');
const router = express.Router();
const {
  createGalleryItem,
  getGalleryItems,
  deleteGalleryItem,
} = require('../controllers/galleryController');
const { protect, execOrAdmin, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getGalleryItems);
router.post('/', protect, execOrAdmin, createGalleryItem);
router.delete('/:id', protect, adminOnly, deleteGalleryItem);

module.exports = router;
