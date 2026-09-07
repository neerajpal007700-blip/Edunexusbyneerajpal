const express = require('express');
const router = express.Router();

const SiteSetting = require('../models/SiteSetting');
const Announcement = require('../models/Announcement');

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await SiteSetting.find({ public: true })
      .select('key value type -_id')
      .lean();

    const data = {};

    settings.forEach(item => {
      data[item.key] = item.value;
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const now = new Date();

    const items = await Announcement.find({
      published: true,
      $or: [
        { publishAt: { $exists: false } },
        { publishAt: null },
        { publishAt: { $lte: now } }
      ],
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: now } }
          ]
        }
      ]
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
