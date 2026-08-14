const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const supportRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    category: {
      type: String,
      enum: ['academic-mentorship', 'conflict-resolution', 'orientation-help', 'general-support'],
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    // Visible to all execs by default; an exec/admin can claim a case by setting this
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
    responses: [responseSchema],
  },
  { timestamps: true }
);

supportRequestSchema.index({ requester: 1, status: 1, createdAt: -1 });
supportRequestSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
