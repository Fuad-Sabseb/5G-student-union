const express = require('express');
const router = express.Router();
const {
  createSupportRequest,
  getMySupportRequests,
  getAllSupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  addResponse,
} = require('../controllers/supportController');
const { protect, execOrAdmin } = require('../middleware/authMiddleware');

// Specific paths before the '/:id' catch-all
router.get('/my', protect, getMySupportRequests);
router.get('/', protect, execOrAdmin, getAllSupportRequests);

router.post('/', protect, createSupportRequest);
router.get('/:id', protect, getSupportRequestById);
router.put('/:id', protect, execOrAdmin, updateSupportRequest);
router.post('/:id/responses', protect, addResponse);

module.exports = router;
