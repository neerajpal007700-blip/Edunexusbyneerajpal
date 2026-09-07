const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  priority: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  publishAt: { type: Date },
  expiresAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

AnnouncementSchema.index({ published: 1, publishAt: 1, expiresAt: 1 });
AnnouncementSchema.index({ priority: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
