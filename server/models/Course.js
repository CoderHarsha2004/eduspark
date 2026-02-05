const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String, // URL to image
    default: ''
  },
  lessons: [{
    title: String,
    description: String,
    videoUrl: String,
    duration: Number, // in minutes
    order: Number,
    materials: [{
      name: String,
      fileUrl: String,
      type: String // 'pdf', 'doc', etc.
    }]
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: { type: Date, default: Date.now },
    progress: {
      completedLessons: [String], // lesson identifiers like "link-0", "video-0"
      overallProgress: { type: Number, default: 0 } // percentage
    }
  }],
  announcements: [{
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [String],
  prerequisites: [String],
  duration: Number, // total course duration in hours
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  feature: {
    title: String,
    content: String
  },
  videos: [{
    title: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  links: [{
    title: String,
    url: String,
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
