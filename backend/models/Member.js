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
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password by default
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
  },
  { timestamps: true }
);

// Hash password before saving
memberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
memberSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);
