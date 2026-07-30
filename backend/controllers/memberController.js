const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');

// @desc    Get all members (with optional filters: status, role, campus, search)
// @route   GET /api/members
// @access  Private/Admin
const getMembers = asyncHandler(async (req, res) => {
  const { status, role, campus, search } = req.query;
  const filter = {};

  if (status) filter.membershipStatus = status;
  if (role) filter.role = role;
  if (campus) filter.campus = campus;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
  }

  const members = await Member.find(filter).sort({ createdAt: -1 });
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
