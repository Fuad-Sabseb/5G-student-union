const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  incrementDownload,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, execOrAdmin, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getResources);
router.get('/:id', getResourceById);
router.post('/', protect, execOrAdmin, createResource);
router.post('/:id/download', incrementDownload);
router.delete('/:id', protect, adminOnly, deleteResource);

module.exports = router;
