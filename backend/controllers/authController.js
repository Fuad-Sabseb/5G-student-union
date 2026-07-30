const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const generateToken = require('../utils/generateToken');

// @desc    Register a new member (public sign-up, always starts as 'member' + 'pending')
// @route   POST /api/auth/register
// @access  Public
const registerMember = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    studentId,
    campus,
    department,
    yearOfStudy,
    homeArea,
    preferredLanguage,
  } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Full name, email and password are required');
  }

  const existingMember = await Member.findOne({ email: email.toLowerCase() });
  if (existingMember) {
    res.status(400);
    throw new Error('A member with this email already exists');
  }

  // Note: role and membershipStatus are intentionally NOT accepted from the request body.
  // New sign-ups always start as 'member' / 'pending' and must be approved by an admin.
  const member = await Member.create({
    fullName,
    email,
    password,
    phone,
    studentId,
    campus,
    department,
    yearOfStudy,
    homeArea,
    preferredLanguage,
  });

  res.status(201).json({
    _id: member._id,
    fullName: member.fullName,
    email: member.email,
    role: member.role,
    membershipStatus: member.membershipStatus,
    preferredLanguage: member.preferredLanguage,
    token: generateToken(member._id, member.role),
  });
});

// @desc    Login member
// @route   POST /api/auth/login
// @access  Public
const loginMember = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const member = await Member.findOne({ email: email.toLowerCase() }).select('+password');

  if (member && (await member.matchPassword(password))) {
    res.json({
      _id: member._id,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      membershipStatus: member.membershipStatus,
      preferredLanguage: member.preferredLanguage,
      token: generateToken(member._id, member.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get logged-in member's own profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json(req.member);
});

// @desc    Update logged-in member's own profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.member._id);

  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  const editableFields = [
    'fullName',
    'phone',
    'studentId',
    'campus',
    'department',
    'yearOfStudy',
    'homeArea',
    'preferredLanguage',
    'profileImageUrl',
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      member[field] = req.body[field];
    }
  });

  // Password change goes through the same flow but gets re-hashed by the pre-save hook
  if (req.body.password) {
    member.password = req.body.password;
  }

  const updated = await member.save();

  res.json({
    _id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    role: updated.role,
    membershipStatus: updated.membershipStatus,
    preferredLanguage: updated.preferredLanguage,
  });
});

module.exports = { registerMember, loginMember, getProfile, updateProfile };
