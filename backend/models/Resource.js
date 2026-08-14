const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['handbook', 'constitution', 'exam', 'notes', 'form', 'general'],
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or path is required'],
      trim: true,
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    fileSize: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'All',
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 7,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

resourceSchema.index({ category: 1, department: 1, createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
