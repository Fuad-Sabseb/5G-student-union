const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');

// @desc    Create a news post or event
// @route   POST /api/announcements
// @access  Private/Exec+Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    type,
    title_en,
    title_or,
    content_en,
    content_or,
    eventDate,
    location,
    imageUrl,
  } = req.body;

  if (!type || !title_en || !title_or || !content_en || !content_or) {
    res.status(400);
    throw new Error('type, title (both languages) and content (both languages) are required');
  }

  const announcement = await Announcement.create({
    type,
    title_en,
    title_or,
    content_en,
    content_or,
    eventDate: type === 'event' ? eventDate : undefined,
    location: type === 'event' ? location : undefined,
    imageUrl,
    author: req.member._id,
  });

  res.status(201).json(announcement);
});

// @desc    Get all announcements (optionally filter by type)
// @route   GET /api/announcements?type=news|event
// @access  Public
const getAnnouncements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;

  const announcements = await Announcement.find(filter)
    .populate('author', 'fullName leadershipPosition')
    .sort({ publishedAt: -1 });

  res.json(announcements);
});

// @desc    Get a single announcement (with comments)
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('author', 'fullName leadershipPosition')
    .populate('comments.member', 'fullName profileImageUrl');

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  res.json(announcement);
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Exec+Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  if (req.body.type !== undefined) {
    announcement.type = req.body.type;
  }

  const editableFields = ['title_en', 'title_or', 'content_en', 'content_or', 'imageUrl'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) announcement[field] = req.body[field];
  });

  // Event-only fields must stay in sync with the (possibly just-changed) type,
  // mirroring the same rule applied on creation.
  if (announcement.type === 'event') {
    if (req.body.eventDate !== undefined) announcement.eventDate = req.body.eventDate;
    if (req.body.location !== undefined) announcement.location = req.body.location;
  } else {
    announcement.eventDate = undefined;
    announcement.location = undefined;
  }

  const updated = await announcement.save();
  res.json(updated);
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  await announcement.deleteOne();
  res.json({ message: 'Announcement removed' });
});

// @desc    Add a comment to an announcement
// @route   POST /api/announcements/:id/comments
// @access  Private (active members only)
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  if (req.member.membershipStatus !== 'active') {
    res.status(403);
    throw new Error('Only active members can comment');
  }

  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  announcement.comments.push({ member: req.member._id, text: text.trim() });
  await announcement.save();

  res.status(201).json(announcement.comments[announcement.comments.length - 1]);
});

// @desc    Delete a comment (own comment, or any comment if admin)
// @route   DELETE /api/announcements/:id/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  const comment = announcement.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const isOwner = comment.member.toString() === req.member._id.toString();
  const isAdmin = req.member.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  comment.deleteOne();
  await announcement.save();
  res.json({ message: 'Comment removed' });
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  addComment,
  deleteComment,
};
