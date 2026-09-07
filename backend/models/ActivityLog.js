const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  module: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
