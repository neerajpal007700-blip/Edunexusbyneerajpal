const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const File = require('../models/File');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../frontend/uploads');
const tempDir = path.join(uploadDir, '_tmp');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

function safeSegment(value, fallback = 'general') {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || fallback;
}

function contentFolder(type) {
  const map = {
    pdf: 'pdfs',
    notes: 'notes',
    mindmap: 'mind-maps',
    assignment: 'assignments',
    'question-paper': 'question-papers',
    ebook: 'ebooks',
    other: 'other'
  };

  return map[type] || 'other';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, safeName);
  }
});

const allowedTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error('This file type is not allowed.'));
    }

    cb(null, true);
  }
});

/* Public: list uploaded files with optional filters */
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.classLevel) {
      filter.classLevel = req.query.classLevel;
    }

    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    if (req.query.chapter) {
      filter.chapter = req.query.chapter;
    }

    if (req.query.contentType) {
      filter.contentType = req.query.contentType;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const files = await File.find(filter)
      .select('-uploadedBy')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (e) {
    next(e);
  }
});

/* Public: single file */
router.get('/:id', async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: 'File not found'
      });
    }

    res.json(file);
  } catch (e) {
    next(e);
  }
});

/* Admin: upload file */
router.post(
  '/upload',
  protect,
  adminOnly,
  upload.single('file'),
  async (req, res, next) => {
    let tempPath = null;
    let finalPath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Please select a file.'
        });
      }

      const classLevel = String(req.body.classLevel || '').trim();
      const subject = String(req.body.subject || '').trim();
      const chapter = String(req.body.chapter || '').trim();
      const contentType = String(
        req.body.contentType || 'other'
      ).trim().toLowerCase();

      if (!classLevel) {
        throw new Error('Class is required.');
      }

      if (!subject) {
        throw new Error('Subject is required.');
      }

      const allowedContentTypes = new Set([
        'pdf',
        'notes',
        'mindmap',
        'assignment',
        'question-paper',
        'ebook',
        'other'
      ]);

      if (!allowedContentTypes.has(contentType)) {
        throw new Error('Invalid content type.');
      }

      tempPath = path.join(tempDir, req.file.filename);

      const classFolder = `class-${safeSegment(classLevel)}`;
      const subjectFolder = safeSegment(subject);
      const typeFolder = contentFolder(contentType);

      const finalDir = path.join(
        uploadDir,
        classFolder,
        subjectFolder,
        typeFolder
      );

      fs.mkdirSync(finalDir, { recursive: true });

      finalPath = path.join(finalDir, req.file.filename);

      fs.renameSync(tempPath, finalPath);
      tempPath = null;

      const relativePath = path.relative(
        uploadDir,
        finalPath
      ).split(path.sep).join('/');

      const file = await File.create({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: `/uploads/${relativePath}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        classLevel,
        subject,
        chapter,
        contentType,
        category: req.body.category || 'general',
        description: req.body.description || '',
        uploadedBy: req.user._id
      });

      res.status(201).json(file);
    } catch (e) {
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      if (finalPath && fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }

      next(e);
    }
  }
);

/* Admin: delete file */
router.delete(
  '/:id',
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const file = await File.findById(req.params.id);

      if (!file) {
        return res.status(404).json({
          message: 'File not found'
        });
      }

      const relativeFile = String(file.filePath || '')
        .replace(/^\/uploads\/?/, '');

      const safeRelative = path.normalize(relativeFile);

      if (
        safeRelative.startsWith('..') ||
        path.isAbsolute(safeRelative)
      ) {
        return res.status(400).json({
          message: 'Invalid file path.'
        });
      }

      const filePath = path.join(uploadDir, safeRelative);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await File.findByIdAndDelete(req.params.id);

      res.json({
        message: 'File deleted successfully'
      });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
