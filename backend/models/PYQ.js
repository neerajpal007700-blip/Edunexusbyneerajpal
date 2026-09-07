const mongoose = require('mongoose');

const PYQSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  year: { type: Number },
  exam: { type: String, trim: true },
  subject: { type: String, trim: true },
  classLevel: { type: String, trim: true },
  chapter: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  pdfUrl: { type: String, trim: true },
  thumbnail: { type: String, trim: true },
  published: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

PYQSchema.index({ year: -1, subject: 1 });
PYQSchema.index({ published: 1, displayOrder: 1 });

module.exports = mongoose.model('PYQ', PYQSchema);
