const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
  type: { type: String, default: 'text' },
  public: { type: Boolean, default: true }
}, { timestamps: true });

SiteSettingSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
