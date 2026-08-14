const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// @desc    Get all resources with category/search/department filters
// @route   GET /api/resources?category=&department=&search=&page=&limit=
// @access  Public
const getResources = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }
  if (req.query.department && req.query.department !== 'All') {
    filter.department = req.query.department;
  }

  if (req.query.search && req.query.search.trim()) {
    const sanitized = escapeRegex(req.query.search.trim());
    filter.$or = [
      { title: { $regex: sanitized, $options: 'i' } },
      { description: { $regex: sanitized, $options: 'i' } },
      { department: { $regex: sanitized, $options: 'i' } },
    ];
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const totalCount = await Resource.countDocuments(filter);
  const resources = await Resource.find(filter)
    .populate('uploadedBy', 'fullName leadershipPosition')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(resources);
});

// @desc    Get resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id).populate(
    'uploadedBy',
    'fullName leadershipPosition'
  );
  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }
  res.json(resource);
});

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private/Exec+Admin
const createResource = asyncHandler(async (req, res) => {
  const { title, description, category, fileUrl, fileType, fileSize, department, yearOfStudy } =
    req.body;

  if (!title || !category || !fileUrl) {
    res.status(400);
    throw new Error('Title, category, and file URL are required');
  }

  const resource = await Resource.create({
    title,
    description: description || '',
    category,
    fileUrl,
    fileType: fileType || 'pdf',
    fileSize: fileSize || '',
    department: department || 'All',
    yearOfStudy: yearOfStudy ? Number(yearOfStudy) : null,
    uploadedBy: req.member._id,
  });

  res.status(201).json(resource);
});

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Public
const incrementDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  resource.downloadsCount = (resource.downloadsCount || 0) + 1;
  await resource.save();
  res.json({ downloadsCount: resource.downloadsCount });
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }
  await resource.deleteOne();
  res.json({ message: 'Resource removed' });
});

module.exports = {
  getResources,
  getResourceById,
  createResource,
  incrementDownload,
  deleteResource,
};
