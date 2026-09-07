const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');

function crud(Model, publicFilter = { published: true }) {
  const router = express.Router();

  /* =========================
     LIST / SEARCH / FILTER
  ========================= */
  router.get('/', async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        sort = 'displayOrder',
        order = 'asc',
        published,
        ...filters
      } = req.query;

      const currentUser = req.user;
      const filter = currentUser?.role === 'admin'
        ? {}
        : { ...publicFilter };

      // Safe filters only
      Object.keys(filters).forEach(key => {
        if (
          ['classLevel', 'subject', 'chapter', 'category',
           'exam', 'status', 'difficulty', 'year', 'type'].includes(key)
        ) {
          if (filters[key] !== '') filter[key] = filters[key];
        }
      });

      if (currentUser?.role === 'admin' && published !== undefined) {
        filter.published = published === 'true';
      }

      if (search.trim()) {
        const text = search.trim();
        filter.$or = [
          { title: { $regex: text, $options: 'i' } },
          { description: { $regex: text, $options: 'i' } },
          { subject: { $regex: text, $options: 'i' } },
          { chapter: { $regex: text, $options: 'i' } }
        ];
      }

      const safePage = Math.max(parseInt(page, 10) || 1, 1);
      const safeLimit = Math.min(
        Math.max(parseInt(limit, 10) || 20, 1),
        100
      );

      const skip = (safePage - 1) * safeLimit;

      const sortOrder = order === 'desc' ? -1 : 1;

      const sortObject = {};
      if (sort === 'createdAt') {
        sortObject.createdAt = sortOrder;
      } else {
        sortObject.displayOrder = sortOrder;
        sortObject.createdAt = -1;
      }

      const [items, total] = await Promise.all([
        Model.find(filter)
          .sort(sortObject)
          .skip(skip)
          .limit(safeLimit)
          .lean(),

        Model.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: items,
        items,
        pagination: {
          page: safePage,
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
     SINGLE ITEM
  ========================= */
  router.get('/:id', async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (e) {
      next(e);
    }
  });

  /* =========================
     CREATE
  ========================= */
  router.post('/', protect, adminOnly, async (req, res, next) => {
    try {
      const item = await Model.create({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: item
      });
    } catch (e) {
      next(e);
    }
  });

  /* =========================
     UPDATE
  ========================= */
  router.put('/:id', protect, adminOnly, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content updated successfully',
        data: item
      });
    } catch (e) {
      next(e);
    }
  });

  /* =========================
     PUBLISH / UNPUBLISH
  ========================= */
  router.patch('/:id/publish', protect, adminOnly, async (req, res, next) => {
    try {
      const published = Boolean(req.body.published);

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { published },
        {
          new: true,
          runValidators: true
        }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: published
          ? 'Content published'
          : 'Content unpublished',
        data: item
      });
    } catch (e) {
      next(e);
    }
  });

  /* =========================
     DISPLAY ORDER
  ========================= */
  router.patch('/:id/order', protect, adminOnly, async (req, res, next) => {
    try {
      const displayOrder = Number(req.body.displayOrder);

      if (!Number.isFinite(displayOrder)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid display order'
        });
      }

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        { displayOrder },
        {
          new: true,
          runValidators: true
        }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (e) {
      next(e);
    }
  });

  /* =========================
     DELETE
  ========================= */
  router.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = crud;
