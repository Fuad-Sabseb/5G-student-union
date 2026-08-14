const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Reply text is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

const forumTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Topic content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['housing', 'rideshare', 'academic', 'general'],
      default: 'general',
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    replies: [replySchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

forumTopicSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
