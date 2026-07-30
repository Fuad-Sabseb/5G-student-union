const express = require('express');
const router = express.Router();
const {
  registerMember,
  loginMember,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerMember);
router.post('/login', loginMember);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
