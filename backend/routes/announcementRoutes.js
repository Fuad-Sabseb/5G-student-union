const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  addComment,
  deleteComment,
  toggleRsvp,
} = require('../controllers/announcementController');
const { protect, execOrAdmin, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', protect, execOrAdmin, createAnnouncement);
router.put('/:id', protect, execOrAdmin, updateAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);

router.post('/:id/rsvp', protect, toggleRsvp);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
