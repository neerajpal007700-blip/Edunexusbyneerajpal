const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Result = require('../models/Result');
const Note = require('../models/Note');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
const MindMap = require('../models/MindMap');
const LiveClass = require('../models/LiveClass');
const ActivityLog = require('../models/ActivityLog');
const SiteSetting = require('../models/SiteSetting');
const Announcement = require('../models/Announcement');

const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

/* =========================
   DASHBOARD STATS
========================= */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      users,
      students,
      admins,
      results,
      notes,
      videos,
      quizzes,
      mindmaps,
      liveClasses
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Result.countDocuments(),
      Note.countDocuments(),
      Video.countDocuments(),
      Quiz.countDocuments(),
      MindMap.countDocuments(),
      LiveClass.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        users,
        students,
        admins,
        results,
        notes,
        videos,
        quizzes,
        mindmaps,
        liveClasses
      }
    });
  } catch (e) {
    next(e);
  }
});

/* =========================
   USERS
========================= */
router.get('/users', async (req, res, next) => {
  try {
    const {
      search = '',
      role,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (role && ['student', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (Math.max(Number(page), 1) - 1) * Math.min(Number(limit), 100);
    const safeLimit = Math.min(Math.max(Number(limit), 1), 100);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (e) {
    next(e);
  }
});

/* =========================
   USER STATUS
========================= */
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ActivityLog.create({
      action: status === 'active' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      module: 'users',
      description: `${user.email} status changed to ${status}`,
      user: req.user._id,
      metadata: { targetUser: user._id }
    });

    res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
});

/* =========================
   ACTIVITY LOGS
========================= */
router.get('/activity', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, logs });
  } catch (e) {
    next(e);
  }
});

/* =========================
   SITE SETTINGS
========================= */
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await SiteSetting.find()
      .sort({ key: 1 })
      .lean();

    res.json({ success: true, settings });
  } catch (e) {
    next(e);
  }
});

router.put('/settings/:key', async (req, res, next) => {
  try {
    const { value, type = 'text', public: isPublic = true } = req.body;

    const setting = await SiteSetting.findOneAndUpdate(
      { key: req.params.key },
      {
        value,
        type,
        public: Boolean(isPublic)
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    await ActivityLog.create({
      action: 'UPDATE_SETTING',
      module: 'settings',
      description: `Updated site setting: ${req.params.key}`,
      user: req.user._id,
      metadata: { key: req.params.key }
    });

    res.json({ success: true, setting });
  } catch (e) {
    next(e);
  }
});

/* =========================
   ANNOUNCEMENTS
========================= */
router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, announcements });
  } catch (e) {
    next(e);
  }
});

router.post('/announcements', async (req, res, next) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id
    });

    await ActivityLog.create({
      action: 'CREATE_ANNOUNCEMENT',
      module: 'announcements',
      description: announcement.title,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      announcement
    });
  } catch (e) {
    next(e);
  }
});

router.put('/announcements/:id', async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await ActivityLog.create({
      action: 'UPDATE_ANNOUNCEMENT',
      module: 'announcements',
      description: announcement.title,
      user: req.user._id
    });

    res.json({ success: true, announcement });
  } catch (e) {
    next(e);
  }
});

router.delete('/announcements/:id', async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await ActivityLog.create({
      action: 'DELETE_ANNOUNCEMENT',
      module: 'announcements',
      description: announcement.title,
      user: req.user._id
    });

    res.json({ success: true, message: 'Announcement deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
