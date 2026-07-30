const express = require('express');
const router = express.Router();
const {
  getMembers,
  getLeadershipDirectory,
  getMemberById,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route — must be declared before the '/:id' route to avoid collision
router.get('/leadership', getLeadershipDirectory);

router.get('/', protect, adminOnly, getMembers);
router.get('/:id', protect, adminOnly, getMemberById);
router.put('/:id', protect, adminOnly, updateMember);
router.delete('/:id', protect, adminOnly, deleteMember);

module.exports = router;
