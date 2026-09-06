const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },

    fileName: {
      type: String,
      required: true,
      unique: true
    },

    filePath: {
      type: String,
      required: true
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true
    },

    classLevel: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    chapter: {
      type: String,
      default: '',
      trim: true
    },

    contentType: {
      type: String,
      enum: [
        'pdf',
        'notes',
        'mindmap',
        'assignment',
        'question-paper',
        'ebook',
        'other'
      ],
      default: 'other'
    },

    category: {
      type: String,
      default: 'general',
      trim: true
    },

    description: {
      type: String,
      default: '',
      trim: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
