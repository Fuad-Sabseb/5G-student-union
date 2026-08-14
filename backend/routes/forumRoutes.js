const express = require('express');
const router = express.Router();
const {
  getTopics,
  getTopicById,
  createTopic,
  toggleLike,
  addReply,
  deleteTopic,
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getTopics);
router.get('/:id', getTopicById);
router.post('/', protect, createTopic);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/replies', protect, addReply);
router.delete('/:id', protect, deleteTopic);

module.exports = router;
