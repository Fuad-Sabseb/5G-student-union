const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { handleAIChat } = require('../controllers/aiController');

// Rate limiter for AI chat: 40 requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { message: 'Too many AI requests from this IP, please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', aiLimiter, handleAIChat);

module.exports = router;
