const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const VerificationCode = require('../models/VerificationCode');
const { sendVerificationEmail } = require('../utils/emailService');
const generateToken = require('../utils/generateToken');

// @desc    Send 6-digit email verification code for registration
// @route   POST /api/auth/send-verification-code
// @access  Public
const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email, language = 'or' } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400);
    throw new Error('A valid email address is required');
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if member is already registered
  const existingMember = await Member.findOne({ email: normalizedEmail });
  if (existingMember) {
    res.status(400);
    throw new Error('An account with this email already exists. Please log in.');
  }

  // Generate secure 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Clear previous pending codes for this email
  await VerificationCode.deleteMany({ email: normalizedEmail });

  // Save new code with 10-minute expiry
  await VerificationCode.create({
    email: normalizedEmail,
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Dispatch email
  const emailResult = await sendVerificationEmail(normalizedEmail, code, language);

  res.json({
    success: true,
    message: 'Verification code sent to your email',
    delivered: emailResult.delivered,
    devCode: (emailResult.isDevMode || !emailResult.delivered || process.env.NODE_ENV !== 'production') ? code : undefined,
  });
});

// @desc    Verify 6-digit email verification code
// @route   POST /api/auth/verify-code
// @access  Public
const verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error('Email and 6-digit verification code are required');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const record = await VerificationCode.findOne({
    email: normalizedEmail,
    code: code.trim(),
    expiresAt: { $gt: Date.now() },
  });

  if (!record) {
    res.status(400);
    throw new Error('Invalid or expired verification code. Please request a new code.');
  }

  record.verified = true;
  await record.save();

  res.json({
    success: true,
    verified: true,
    message: 'Email successfully verified',
  });
});

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
    verificationCode,
    isAlumni,
    graduationYear,
    currentOccupation,
    currentCompany,
    currentLocation,
    linkedinUrl,
    alumniBio,
    willingToMentor,
  } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Full name, email and password are required');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingMember = await Member.findOne({ email: normalizedEmail });
  if (existingMember) {
    res.status(400);
    throw new Error('A member with this email already exists');
  }

  // Validate that email has been verified via 6-digit code
  const verifiedRecord = await VerificationCode.findOne({
    email: normalizedEmail,
    $or: [{ verified: true }, ...(verificationCode ? [{ code: verificationCode.trim() }] : [])],
    expiresAt: { $gt: Date.now() },
  });

  if (!verifiedRecord) {
    res.status(400);
    throw new Error('Email verification is required. Please verify your 6-digit code first.');
  }

  // Clean up verification records
  await VerificationCode.deleteMany({ email: normalizedEmail });

  // Note: role and membershipStatus are intentionally NOT accepted from the request body.
  // New sign-ups always start as 'member' / 'pending' and must be approved by an admin.
  const member = await Member.create({
    fullName,
    email: normalizedEmail,
    password,
    phone,
    studentId: isAlumni ? undefined : studentId,
    campus,
    department,
    yearOfStudy: isAlumni ? undefined : yearOfStudy,
    homeArea,
    preferredLanguage,
    isAlumni: Boolean(isAlumni),
    graduationYear: graduationYear ? Number(graduationYear) : undefined,
    currentOccupation: currentOccupation || '',
    currentCompany: currentCompany || '',
    currentLocation: currentLocation || '',
    linkedinUrl: linkedinUrl || '',
    alumniBio: alumniBio || '',
    willingToMentor: Boolean(willingToMentor),
    isVerified: true,
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

const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Update logged-in member's own profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.member._id).select('+password');

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
    'isAlumni',
    'graduationYear',
    'currentOccupation',
    'currentCompany',
    'currentLocation',
    'linkedinUrl',
    'alumniBio',
    'willingToMentor',
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      member[field] = req.body[field];
    }
  });

  // Secure Password Change (requires currentPassword verification if member has a password set)
  if (req.body.newPassword) {
    if (req.body.newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    if (member.password && !member.googleId) {
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error('Current password is required to set a new password');
      }
      const isMatch = await member.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(400);
        throw new Error('Current password does not match');
      }
    }

    member.password = req.body.newPassword;
  }

  const updated = await member.save();

  res.json({
    _id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    studentId: updated.studentId,
    campus: updated.campus,
    department: updated.department,
    yearOfStudy: updated.yearOfStudy,
    homeArea: updated.homeArea,
    role: updated.role,
    membershipStatus: updated.membershipStatus,
    preferredLanguage: updated.preferredLanguage,
    profileImageUrl: updated.profileImageUrl,
  });
});

// @desc    Forgot Password - generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const member = await Member.findOne({ email: email.toLowerCase() });
  if (!member) {
    // Return friendly message even if user doesn't exist for security
    return res.json({
      message: 'If an account with that email exists, password reset instructions have been generated.',
    });
  }

  // Generate crypto token
  const resetToken = crypto.randomBytes(24).toString('hex');
  member.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  member.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  await member.save();

  res.json({
    message: 'Password reset link generated successfully.',
    resetToken,
    resetUrl: `/reset-password/${resetToken}`,
  });
});

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const member = await Member.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!member) {
    res.status(400);
    throw new Error('Password reset token is invalid or has expired');
  }

  member.password = password;
  member.resetPasswordToken = null;
  member.resetPasswordExpire = null;
  await member.save();

  res.json({
    message: 'Password reset successful. You can now log in.',
    token: generateToken(member._id, member.role),
    _id: member._id,
    fullName: member.fullName,
    email: member.email,
    role: member.role,
    membershipStatus: member.membershipStatus,
  });
});

function formatNameFromEmail(email) {
  if (!email) return 'GBSG Member';
  const localPart = email.split('@')[0];
  const cleaned = localPart.replace(/\d+$/, '');
  const parts = cleaned.split(/[._\-\+]+/).filter(Boolean);
  if (parts.length === 0) {
    const raw = localPart.replace(/[._\-\+]+/g, ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

// @desc    Register or Login via Google OAuth (Secure ID Token Verification)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, preferredLanguage, isAlumni, graduationYear, currentOccupation, currentCompany, currentLocation, linkedinUrl, alumniBio, willingToMentor } = req.body;

  console.log('Google auth request received');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('idToken present:', !!idToken);
  console.log('GOOGLE_CLIENT_ID configured:', !!process.env.GOOGLE_CLIENT_ID);

  if (!idToken) {
    console.error('No idToken provided in request');
    res.status(400);
    throw new Error('Google ID token is required');
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID environment variable not set');
    res.status(500);
    throw new Error('Google OAuth is not configured on the server. Please contact the administrator.');
  }

  let ticket;
  try {
    console.log('Attempting to verify ID token...');
    // Verify the ID token with Google's public keys
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log('Token verification successful');
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    console.error('Error details:', error);
    res.status(401);
    throw new Error('Invalid Google ID token. Please try signing in again.');
  }

  const payload = ticket.getPayload();
  
  // Extract verified claims from the ID token
  const {
    sub: googleSub,        // Google's stable user identifier
    email,                 // Verified email address
    name: fullName,        // User's full name
    picture: profileImageUrl, // Profile picture URL
    email_verified: emailVerified,
  } = payload;

  if (!emailVerified) {
    res.status(400);
    throw new Error('Google email is not verified. Please verify your email with Google first.');
  }

  const normalizedEmail = email.toLowerCase();

  // Check if member exists by googleSub (preferred) or email (fallback for migration)
  let member = await Member.findOne({
    $or: [
      { googleSub },
      { email: normalizedEmail },
    ],
  });

  if (member) {
    // Existing member - update Google authentication fields
    let updated = false;

    if (!member.googleSub && googleSub) {
      member.googleSub = googleSub;
      updated = true;
    }

    // Migrate legacy googleId to googleSub if needed
    if (member.googleId && !member.googleSub) {
      member.googleSub = googleSub;
      updated = true;
    }

    if (profileImageUrl && !member.profileImageUrl) {
      member.profileImageUrl = profileImageUrl;
      updated = true;
    }

    if (fullName && (!member.fullName || member.fullName === formatNameFromEmail(member.email))) {
      member.fullName = fullName;
      updated = true;
    }

    if (updated) {
      await member.save();
    }

    res.json({
      _id: member._id,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      membershipStatus: member.membershipStatus,
      preferredLanguage: member.preferredLanguage,
      profileImageUrl: member.profileImageUrl,
      isAlumni: member.isAlumni,
      token: generateToken(member._id, member.role),
    });
  } else {
    // New member registration via Google
    const derivedName = fullName && fullName.trim() !== '' ? fullName : formatNameFromEmail(normalizedEmail);

    member = await Member.create({
      fullName: derivedName,
      email: normalizedEmail,
      googleSub,
      googleId: `google_${googleSub}`, // Legacy field for backward compatibility
      profileImageUrl: profileImageUrl || '',
      preferredLanguage: preferredLanguage || 'or',
      isAlumni: Boolean(isAlumni),
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      currentOccupation: currentOccupation || '',
      currentCompany: currentCompany || '',
      currentLocation: currentLocation || '',
      linkedinUrl: linkedinUrl || '',
      alumniBio: alumniBio || '',
      willingToMentor: Boolean(willingToMentor),
      isVerified: true, // Google-verified email
    });

    res.status(201).json({
      _id: member._id,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      membershipStatus: member.membershipStatus,
      preferredLanguage: member.preferredLanguage,
      profileImageUrl: member.profileImageUrl,
      isAlumni: member.isAlumni,
      token: generateToken(member._id, member.role),
    });
  }
});

module.exports = {
  sendVerificationCode,
  verifyCode,
  registerMember,
  loginMember,
  googleAuth,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};

