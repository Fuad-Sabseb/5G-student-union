const asyncHandler = require('express-async-handler');
const SupportRequest = require('../models/SupportRequest');

// @desc    Submit a mentorship/conflict-resolution/support request
// @route   POST /api/support-requests
// @access  Private (any logged-in member)
const createSupportRequest = asyncHandler(async (req, res) => {
  const { category, subject, description } = req.body;
  if (!category || !subject || !description) {
    res.status(400);
    throw new Error('category, subject and description are required');
  }

  const request = await SupportRequest.create({
    requester: req.member._id,
    category,
    subject,
    description,
  });

  res.status(201).json(request);
});

// @desc    Get the logged-in member's own support requests
// @route   GET /api/support-requests/my
// @access  Private
const getMySupportRequests = asyncHandler(async (req, res) => {
  const requests = await SupportRequest.find({ requester: req.member._id }).sort({
    createdAt: -1,
  });
  res.json(requests);
});

// @desc    Get all support requests (visible to all execs by default; filterable)
// @route   GET /api/support-requests?status=&category=&assignedTo=
// @access  Private/Exec+Admin
const getAllSupportRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  const requests = await SupportRequest.find(filter)
    .populate('requester', 'fullName email department campus')
    .populate('assignedTo', 'fullName leadershipPosition')
    .sort({ createdAt: -1 });

  res.json(requests);
});

// @desc    Get a single support request (requester or exec/admin only)
// @route   GET /api/support-requests/:id
// @access  Private
const getSupportRequestById = asyncHandler(async (req, res) => {
  const request = await SupportRequest.findById(req.params.id)
    .populate('requester', 'fullName email department campus')
    .populate('assignedTo', 'fullName leadershipPosition')
    .populate('responses.author', 'fullName leadershipPosition');

  if (!request) {
    res.status(404);
    throw new Error('Support request not found');
  }

  const isRequester = request.requester._id.toString() === req.member._id.toString();
  const isExecOrAdmin = req.member.role === 'exec' || req.member.role === 'admin';

  if (!isRequester && !isExecOrAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this request');
  }

  res.json(request);
});

// @desc    Update status or assignment of a support request
// @route   PUT /api/support-requests/:id
// @access  Private/Exec+Admin
const updateSupportRequest = asyncHandler(async (req, res) => {
  const request = await SupportRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Support request not found');
  }

  const { status, assignedTo } = req.body;
  if (status !== undefined) request.status = status;
  if (assignedTo !== undefined) request.assignedTo = assignedTo;

  const updated = await request.save();
  res.json(updated);
});

// @desc    Add a response/note to a support request (requester or exec/admin)
// @route   POST /api/support-requests/:id/responses
// @access  Private
const addResponse = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Response text is required');
  }

  const request = await SupportRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Support request not found');
  }

  const isRequester = request.requester.toString() === req.member._id.toString();
  const isExecOrAdmin = req.member.role === 'exec' || req.member.role === 'admin';

  if (!isRequester && !isExecOrAdmin) {
    res.status(403);
    throw new Error('Not authorized to respond to this request');
  }

  request.responses.push({ author: req.member._id, text: text.trim() });
  await request.save();

  res.status(201).json(request.responses[request.responses.length - 1]);
});

module.exports = {
  createSupportRequest,
  getMySupportRequests,
  getAllSupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  addResponse,
};
