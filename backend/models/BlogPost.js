const mongoose = require('mongoose');

// Blog posts are member-authored articles (learning/teaching content, experiences, advice
// for new students, etc). Unlike official Announcements, a single post is written in
// whichever language the author chooses — it is not required to have both translations.
const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    language: { type: String, enum: ['en', 'or'], required: true },
    coverImageUrl: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    // Lets admins moderate/hide a post without deleting it
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogPostSchema.index({ published: 1, language: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
