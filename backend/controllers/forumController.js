const asyncHandler = require('express-async-handler');
const ForumTopic = require('../models/ForumTopic');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// @desc    Get forum topics with category/search filters & pagination
// @route   GET /api/forum?category=&search=&page=&limit=
// @access  Public
const getTopics = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }

  if (req.query.search && req.query.search.trim()) {
    const sanitized = escapeRegex(req.query.search.trim());
    filter.$or = [
      { title: { $regex: sanitized, $options: 'i' } },
      { content: { $regex: sanitized, $options: 'i' } },
    ];
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const totalCount = await ForumTopic.countDocuments(filter);
  const topics = await ForumTopic.find(filter)
    .populate('author', 'fullName profileImageUrl leadershipPosition campus')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(topics);
});

// @desc    Get topic by ID with populated author and replies
// @route   GET /api/forum/:id
// @access  Public
const getTopicById = asyncHandler(async (req, res) => {
  const topic = await ForumTopic.findById(req.params.id)
    .populate('author', 'fullName profileImageUrl leadershipPosition campus department')
    .populate('replies.author', 'fullName profileImageUrl leadershipPosition campus department');

  if (!topic) {
    res.status(404);
    throw new Error('Topic not found');
  }
  res.json(topic);
});

// @desc    Create a new topic
// @route   POST /api/forum
// @access  Private (any active member)
const createTopic = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const topic = await ForumTopic.create({
    title,
    content,
    category: category || 'general',
    author: req.member._id,
  });

  const populated = await ForumTopic.findById(topic._id).populate(
    'author',
    'fullName profileImageUrl'
  );
  res.status(201).json(populated);
});

// @desc    Toggle like on a topic
// @route   POST /api/forum/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const topic = await ForumTopic.findById(req.params.id);
  if (!topic) {
    res.status(404);
    throw new Error('Topic not found');
  }

  const index = topic.likes.findIndex((id) => id.toString() === req.member._id.toString());
  let isLiked = false;

  if (index > -1) {
    topic.likes.splice(index, 1);
    isLiked = false;
  } else {
    topic.likes.push(req.member._id);
    isLiked = true;
  }

  await topic.save();
  res.json({ isLiked, likesCount: topic.likes.length });
});

// @desc    Add a reply to a topic
// @route   POST /api/forum/:id/replies
// @access  Private
const addReply = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Reply text is required');
  }

  const topic = await ForumTopic.findById(req.params.id);
  if (!topic) {
    res.status(404);
    throw new Error('Topic not found');
  }

  if (topic.isClosed) {
    res.status(400);
    throw new Error('This topic is closed for new replies');
  }

  topic.replies.push({
    author: req.member._id,
    text: text.trim(),
  });

  await topic.save();

  const updated = await ForumTopic.findById(req.params.id)
    .populate('author', 'fullName profileImageUrl')
    .populate('replies.author', 'fullName profileImageUrl leadershipPosition');

  res.status(201).json(updated.replies[updated.replies.length - 1]);
});

// @desc    Delete a topic (author or admin)
// @route   DELETE /api/forum/:id
// @access  Private
const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await ForumTopic.findById(req.params.id);
  if (!topic) {
    res.status(404);
    throw new Error('Topic not found');
  }

  const isAuthor = topic.author.toString() === req.member._id.toString();
  const isAdmin = req.member.role === 'admin';

  if (!isAuthor && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this topic');
  }

  await topic.deleteOne();
  res.json({ message: 'Topic removed' });
});

module.exports = {
  getTopics,
  getTopicById,
  createTopic,
  toggleLike,
  addReply,
  deleteTopic,
};
