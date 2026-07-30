const asyncHandler = require('express-async-handler');
const BlogPost = require('../models/BlogPost');

// @desc    Create a blog post/article
// @route   POST /api/blog
// @access  Private (active members only)
const createBlogPost = asyncHandler(async (req, res) => {
  if (req.member.membershipStatus !== 'active') {
    res.status(403);
    throw new Error('Only active members can publish articles');
  }

  const { title, content, language, coverImageUrl } = req.body;
  if (!title || !content || !language) {
    res.status(400);
    throw new Error('title, content and language are required');
  }

  const post = await BlogPost.create({
    title,
    content,
    language,
    coverImageUrl,
    author: req.member._id,
  });

  res.status(201).json(post);
});

// @desc    Get published blog posts (optionally filter by language)
// @route   GET /api/blog?language=en|or
// @access  Public
const getBlogPosts = asyncHandler(async (req, res) => {
  const filter = { published: true };
  if (req.query.language) filter.language = req.query.language;

  const posts = await BlogPost.find(filter)
    .populate('author', 'fullName profileImageUrl department')
    .sort({ createdAt: -1 });

  res.json(posts);
});

// @desc    Get a single blog post
// @route   GET /api/blog/:id
// @access  Public
const getBlogPostById = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id).populate(
    'author',
    'fullName profileImageUrl department'
  );
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(post);
});

// @desc    Get ALL blog posts (published and hidden) for moderation
// @route   GET /api/blog/admin/all
// @access  Private/Admin
const getAllBlogPostsAdmin = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({})
    .populate('author', 'fullName email')
    .sort({ createdAt: -1 });
  res.json(posts);
});

// @desc    Update own blog post (or any post if admin)
// @route   PUT /api/blog/:id
// @access  Private
const updateBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isOwner = post.author.toString() === req.member._id.toString();
  const isAdmin = req.member.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to edit this post');
  }

  const editableFields = ['title', 'content', 'language', 'coverImageUrl'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) post[field] = req.body[field];
  });

  // Only admins can publish/unpublish (moderation)
  if (isAdmin && req.body.published !== undefined) {
    post.published = req.body.published;
  }

  const updated = await post.save();
  res.json(updated);
});

// @desc    Delete own blog post (or any post if admin)
// @route   DELETE /api/blog/:id
// @access  Private
const deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isOwner = post.author.toString() === req.member._id.toString();
  const isAdmin = req.member.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await post.deleteOne();
  res.json({ message: 'Post removed' });
});

module.exports = {
  createBlogPost,
  getBlogPosts,
  getBlogPostById,
  getAllBlogPostsAdmin,
  updateBlogPost,
  deleteBlogPost,
};
