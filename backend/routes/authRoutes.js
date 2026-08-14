const express = require('express');
const router = express.Router();
const {
  sendVerificationCode,
  verifyCode,
  registerMember,
  loginMember,
  googleAuth,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/register', registerMember);
router.post('/login', loginMember);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
