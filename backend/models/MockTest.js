const mongoose = require('mongoose');

const MockTestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  exam: { type: String, trim: true },
  subject: { type: String, trim: true },
  classLevel: { type: String, trim: true },
  duration: { type: Number, default: 30 },
  totalMarks: { type: Number, default: 0 },
  passingMarks: { type: Number, default: 0 },
  instructions: { type: String, trim: true },
  questions: [{
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'true-false'],
      default: 'mcq'
    },
    options: [{ type: String }],
    correctAnswer: { type: String },
    explanation: { type: String },
    marks: { type: Number, default: 1 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  published: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

MockTestSchema.index({ status: 1, displayOrder: 1 });
MockTestSchema.index({ subject: 1, classLevel: 1 });

module.exports = mongoose.model('MockTest', MockTestSchema);
