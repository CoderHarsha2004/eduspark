const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, isFacultyOrAdmin, isStudentFacultyOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public browse)
router.get('/published', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;

    const query = {}; // Remove status filter to show all courses

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all courses
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all courses' });
    }

    const courses = await Course.find({})
      .populate('instructor', 'name email')
      .populate('enrolledStudents.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Get my courses
router.get('/faculty/my-courses', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get enrolled courses
router.get('/student/enrolled', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view enrolled courses' });
    }

    const user = await User.findById(req.user._id).populate('enrolledCourses');
    const courses = user.enrolledCourses;

    res.json({ courses });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course details
router.get('/:courseId', authenticateToken, isStudentFacultyOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('instructor', 'name email')
      .populate({
        path: 'assignments',
        populate: {
          path: 'submissions.student',
          select: 'name email'
        }
      })
      .populate('enrolledStudents.student', 'name email')
      .populate('announcements.createdBy', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check access permissions
    const isEnrolled = course.enrolledStudents.some(
      e => e.student.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor._id.toString() === req.user._id.toString();
    const isPublished = course.status === 'published';

    // Allow access if: enrolled, instructor, admin, or published course
    if (!isEnrolled && !isInstructor && req.user.role !== 'admin' && !isPublished) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Create course
router.post('/', authenticateToken, isFacultyOrAdmin, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').trim().isLength({ min: 2 }).withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, thumbnail, tags, prerequisites, duration, level, videos, links, feature } = req.body;

    const course = new Course({
      title,
      description,
      category,
      thumbnail,
      tags: tags || [],
      prerequisites: prerequisites || [],
      duration,
      level: level || 'beginner',
      instructor: req.user._id,
      videos: videos || [],
      links: links || [],
      feature
    });

    await course.save();

    // Add to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });

    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Update course
router.put('/:courseId', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json({ course: updatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Delete course
router.delete('/:courseId', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Course.findByIdAndDelete(req.params.courseId);

    // Remove from instructor's created courses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: req.params.courseId }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Enroll in course
router.post('/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      e => e.student.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    course.enrolledStudents.push({
      student: req.user._id,
      enrolledAt: new Date(),
      progress: {
        completedLessons: [],
        overallProgress: 0
      }
    });

    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: course._id }
    });

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Get my courses
router.get('/faculty/my-courses', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get enrolled courses
router.get('/student/enrolled', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view enrolled courses' });
    }

    const user = await User.findById(req.user._id).populate('enrolledCourses');
    const courses = user.enrolledCourses;

    res.json({ courses });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Add lesson to course
router.post('/:courseId/lessons', authenticateToken, isFacultyOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Lesson title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Lesson description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, videoUrl, duration, materials } = req.body;

    const lesson = {
      title,
      description,
      videoUrl,
      duration: duration || 0,
      order: course.lessons.length,
      materials: materials || []
    };

    course.lessons.push(lesson);
    await course.save();

    res.status(201).json({ lesson });
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Post announcement
router.post('/:courseId/announcements', authenticateToken, isFacultyOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Announcement title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Announcement content is required'),
  body('date').optional().isISO8601().withMessage('Valid date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, date } = req.body;

    const announcement = {
      title,
      content,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id,
      createdAt: new Date()
    };

    course.announcements.push(announcement);
    await course.save();

    // Get all enrolled students and admins to notify
    const enrolledStudentIds = course.enrolledStudents.map(e => e.student);
    const admins = await User.find({ role: 'admin' }).select('_id');
    const adminIds = admins.map(admin => admin._id);

    // Combine all users to notify (students + admins)
    const usersToNotify = [...new Set([...enrolledStudentIds, ...adminIds])];

    // Create notification message
    const notificationMessage = `New announcement in "${course.title}": ${title}`;

    // Add notification to all relevant users
    await User.updateMany(
      { _id: { $in: usersToNotify } },
      {
        $push: {
          notifications: {
            message: notificationMessage,
            type: 'announcement',
            read: false,
            createdAt: new Date()
          }
        }
      }
    );

    res.status(201).json({ announcement });
  } catch (error) {
    console.error('Post announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Update progress
router.put('/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can update progress' });
    }

    const { completedLessons } = req.body;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is enrolled
    const enrollmentIndex = course.enrolledStudents.findIndex(
      e => e.student.toString() === req.user._id.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Update progress
    course.enrolledStudents[enrollmentIndex].progress.completedLessons = completedLessons;
    const totalLessons = (course.videos || []).length + (course.links || []).length;
    const progressPercent = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
    course.enrolledStudents[enrollmentIndex].progress.overallProgress = Math.round(progressPercent);

    await course.save();

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
