const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { authenticateToken, isFacultyOrAdmin } = require('../middleware/auth');

const router = express.Router();

/* ================================
   CREATE ANNOUNCEMENT
   Admin & Faculty only
================================ */
router.post(
  '/',
  authenticateToken,
  isFacultyOrAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('targetRoles')
      .isArray({ min: 1 })
      .withMessage('At least one target role is required'),
    body('targetRoles.*')
      .isIn(['admin', 'faculty', 'student'])
      .withMessage('Invalid target role')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, targetRoles } = req.body;

      const announcement = new Announcement({
        title,
        content,
        targetRoles,
        createdBy: req.user.id // ✅ FIXED
      });

      await announcement.save();

      // Send notifications (excluding faculty if intentional)
      const filteredTargetRoles = targetRoles.filter(role => role !== 'faculty');

      const targetUsers = await User.find({
        role: { $in: filteredTargetRoles },
        status: 'approved'
      });

      await Promise.all(
        targetUsers.map(user => {
          user.notifications.push({
            message: `New announcement: ${title}`,
            type: 'announcement',
            read: false
          });
          return user.save();
        })
      );

      res.status(201).json({
        message: 'Announcement created successfully',
        announcement
      });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ================================
   GET ANNOUNCEMENTS (ROLE BASED)
================================ */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      targetRoles: { $in: [req.user.role] }, // ✅ FIXED
      isActive: true
    })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================================
   UPDATE ANNOUNCEMENT
   Creator or Admin
================================ */
router.put(
  '/:id',
  authenticateToken,
  isFacultyOrAdmin,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('targetRoles').optional().isArray({ min: 1 }),
    body('targetRoles.*')
      .optional()
      .isIn(['admin', 'faculty', 'student'])
      .withMessage('Invalid target role'),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      if (
        req.user.role !== 'admin' &&
        announcement.createdBy.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: 'Access denied' });
      }

      Object.assign(announcement, req.body);
      await announcement.save();

      res.json({
        message: 'Announcement updated successfully',
        announcement
      });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/* ================================
   DELETE ANNOUNCEMENT
   Creator or Admin
================================ */
router.delete('/:id', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (
      req.user.role !== 'admin' &&
      announcement.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
