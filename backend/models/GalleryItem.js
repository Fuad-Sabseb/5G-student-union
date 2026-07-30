const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    caption_en: { type: String, trim: true, default: '' },
    caption_or: { type: String, trim: true, default: '' },
    album: { type: String, trim: true, default: 'General' }, // e.g. "Freshman Welcome 2025"
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
