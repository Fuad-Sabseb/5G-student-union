const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // never return password by default
      validate: {
        validator: function (v) {
          // Password required if not signing in via Google
          return this.googleId || (v && v.length >= 6);
        },
        message: 'Password is required and must be at least 6 characters',
      },
    },
    googleId: {
      type: String,
      trim: true,
      default: null,
      // Legacy field - kept for backward compatibility with existing accounts
      // New Google OAuth accounts should use googleSub
    },
    googleSub: {
      type: String,
      trim: true,
      default: null,
      unique: true,
      sparse: true,
      index: true,
      // Google's stable user identifier from verified ID tokens
    },
    phone: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    campus: {
      type: String, // e.g. "Jimma University Main Campus", "Institute of Technology"
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 7,
    },
    homeArea: {
      type: String, // specific kebele/town within Shanan Gibe the member is from
      trim: true,
    },

    // --- Alumni Network fields ---
    isAlumni: {
      type: Boolean,
      default: false,
      index: true,
    },
    graduationYear: {
      type: Number,
      min: 1980,
      max: 2050,
    },
    currentOccupation: {
      type: String,
      trim: true,
      default: '',
    },
    currentCompany: {
      type: String,
      trim: true,
      default: '',
    },
    currentLocation: {
      type: String, // e.g. "Addis Ababa, Ethiopia", "Nairobi, Kenya"
      trim: true,
      default: '',
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },
    alumniBio: {
      type: String,
      trim: true,
      default: '',
    },
    willingToMentor: {
      type: Boolean,
      default: false,
    },

    // --- Role & membership status ---
    role: {
      type: String,
      enum: ['member', 'exec', 'admin'],
      default: 'member',
    },
    membershipStatus: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending',
    },

    // --- Leadership directory fields (only used when role = 'exec' or 'admin') ---
    leadershipPosition: {
      type: String, // e.g. "Chairperson", "Secretary", "Public Relations Officer"
      trim: true,
      default: '',
    },
    leadershipOrder: {
      type: Number, // controls display order on the leadership directory page
      default: 0,
    },

    profileImageUrl: {
      type: String,
      default: '',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'or'],
      default: 'or',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

memberSchema.index({ role: 1, membershipStatus: 1 });

// Hash password before saving
memberSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
memberSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);
