const ActivityLog = require('../models/ActivityLog');

async function logActivity({ action, module, description, user, metadata = {} }) {
  try {
    await ActivityLog.create({
      action,
      module,
      description,
      user: user?._id || user,
      metadata
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
}

module.exports = { logActivity };
