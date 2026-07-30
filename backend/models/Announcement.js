const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const announcementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['news', 'event'],
      required: true,
    },
    // Bilingual fields — admin enters both when publishing
    title_en: { type: String, required: true, trim: true },
    title_or: { type: String, required: true, trim: true },
    content_en: { type: String, required: true },
    content_or: { type: String, required: true },

    // Event-specific (ignored for type='news')
    eventDate: { type: Date },
    location: { type: String, trim: true },

    imageUrl: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    comments: [commentSchema],
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
