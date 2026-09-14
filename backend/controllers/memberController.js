const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// @desc    Get all members (with optional filters: status, role, campus, isAlumni, graduationYear, department, search, pagination)
// @route   GET /api/members?status=&role=&campus=&isAlumni=&graduationYear=&department=&search=&page=&limit=
// @access  Private/Admin
const getMembers = asyncHandler(async (req, res) => {
  const { status, role, campus, isAlumni, graduationYear, department, search, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (status) filter.membershipStatus = status;
  if (role) filter.role = role;
  if (campus) filter.campus = campus;
  if (department) filter.department = department;
  if (graduationYear) filter.graduationYear = Number(graduationYear);
  if (isAlumni !== undefined && isAlumni !== '') {
    filter.isAlumni = isAlumni === 'true' || isAlumni === true;
  }

  if (search && search.trim()) {
    const sanitized = escapeRegex(search.trim());
    filter.$or = [
      { fullName: { $regex: sanitized, $options: 'i' } },
      { email: { $regex: sanitized, $options: 'i' } },
      { studentId: { $regex: sanitized, $options: 'i' } },
      { currentOccupation: { $regex: sanitized, $options: 'i' } },
      { currentCompany: { $regex: sanitized, $options: 'i' } },
      { currentLocation: { $regex: sanitized, $options: 'i' } },
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

// @desc    Get public alumni directory (only active members with isAlumni: true)
// @route   GET /api/members/alumni?graduationYear=&department=&willingToMentor=&search=
// @access  Public
const getAlumniDirectory = asyncHandler(async (req, res) => {
  const { graduationYear, department, willingToMentor, search } = req.query;
  const filter = {
    isAlumni: true,
    membershipStatus: 'active',
  };

  if (graduationYear) {
    filter.graduationYear = Number(graduationYear);
  }

  if (department) {
    filter.department = department;
  }

  if (willingToMentor === 'true' || willingToMentor === true) {
    filter.willingToMentor = true;
  }

  if (search && search.trim()) {
    const sanitized = escapeRegex(search.trim());
    filter.$or = [
      { fullName: { $regex: sanitized, $options: 'i' } },
      { currentOccupation: { $regex: sanitized, $options: 'i' } },
      { currentCompany: { $regex: sanitized, $options: 'i' } },
      { currentLocation: { $regex: sanitized, $options: 'i' } },
      { alumniBio: { $regex: sanitized, $options: 'i' } },
    ];
  }

  // Strictly omit private fields (email, phone, studentId, passwords)
  const alumni = await Member.find(filter)
    .select(
      'fullName graduationYear currentOccupation currentCompany currentLocation linkedinUrl alumniBio willingToMentor profileImageUrl department campus'
    )
    .sort({ graduationYear: -1, fullName: 1 });

  res.json(alumni);
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

// @desc    Update a member's status, role, or alumni info (approve membership, promote to exec, flip isAlumni, etc.)
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
    'isAlumni',
    'graduationYear',
    'currentOccupation',
    'currentCompany',
    'currentLocation',
    'linkedinUrl',
    'alumniBio',
    'willingToMentor',
    'department',
    'campus',
  ];

  adminEditableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'graduationYear') {
        member[field] = req.body[field] ? Number(req.body[field]) : undefined;
      } else if (field === 'isAlumni' || field === 'willingToMentor') {
        member[field] = Boolean(req.body[field]);
      } else {
        member[field] = req.body[field];
      }
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
  getAlumniDirectory,
  getLeadershipDirectory,
  getMemberById,
  updateMember,
  deleteMember,
};
