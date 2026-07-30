const express = require('express');
const router = express.Router();
const {
  createBlogPost,
  getBlogPosts,
  getBlogPostById,
  getAllBlogPostsAdmin,
  updateBlogPost,
  deleteBlogPost,
} = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Specific path before the '/:id' catch-all
router.get('/admin/all', protect, adminOnly, getAllBlogPostsAdmin);

router.get('/', getBlogPosts);
router.get('/:id', getBlogPostById);
router.post('/', protect, createBlogPost);
router.put('/:id', protect, updateBlogPost);
router.delete('/:id', protect, deleteBlogPost);

module.exports = router;
