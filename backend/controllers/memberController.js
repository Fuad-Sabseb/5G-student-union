const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// @desc    Get all members (with optional filters: status, role, campus, search, pagination)
// @route   GET /api/members?status=&role=&campus=&search=&page=&limit=
// @access  Private/Admin
const getMembers = asyncHandler(async (req, res) => {
  const { status, role, campus, search, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (status) filter.membershipStatus = status;
  if (role) filter.role = role;
  if (campus) filter.campus = campus;
  if (search && search.trim()) {
    const sanitized = escapeRegex(search.trim());
    filter.$or = [
      { fullName: { $regex: sanitized, $options: 'i' } },
      { email: { $regex: sanitized, $options: 'i' } },
      { studentId: { $regex: sanitized, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const totalCount = await Member.countDocuments(filter);
  const members = await Member.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json(members);
});

// @desc    Get public leadership/executive committee directory
// @route   GET /api/members/leadership
// @access  Public
const getLeadershipDirectory = asyncHandler(async (req, res) => {
  const leaders = await Member.find({
    role: { $in: ['exec', 'admin'] },
    membershipStatus: 'active',
  })
    .select('fullName leadershipPosition leadershipOrder profileImageUrl department campus')
    .sort({ leadershipOrder: 1 });

  res.json(leaders);
});

// @desc    Get a single member by ID
// @route   GET /api/members/:id
// @access  Private/Admin
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  res.json(member);
});

// @desc    Update a member's status, role, or leadership info (approve membership, promote to exec, etc.)
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  const adminEditableFields = [
    'membershipStatus',
    'role',
    'leadershipPosition',
    'leadershipOrder',
  ];

  adminEditableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      member[field] = req.body[field];
    }
  });

  const updated = await member.save();
  res.json(updated);
});

// @desc    Delete a member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  await member.deleteOne();
  res.json({ message: 'Member removed' });
});

module.exports = {
  getMembers,
  getLeadershipDirectory,
  getMemberById,
  updateMember,
  deleteMember,
};
