const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, isFacultyOrAdmin, isStudentFacultyOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Faculty: Create assignment
router.post('/', authenticateToken, isFacultyOrAdmin, [
  body('courseId').isMongoId().withMessage('Valid course ID required'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('dueDate').isISO8601().withMessage('Valid due date required'),
  body('maxPoints').isInt({ min: 1 }).withMessage('Max points must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, title, description, dueDate, maxPoints, instructions } = req.body;

    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = new Assignment({
      course: courseId,
      title,
      description,
      dueDate,
      maxPoints,
      instructions
    });

    await assignment.save();

    // Add assignment to course
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json({ assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Create quiz assessment (simplified version without file uploads)
router.post('/quiz', authenticateToken, isFacultyOrAdmin, [
  body('courseId').isMongoId().withMessage('Valid course ID required'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('dueDate').isISO8601().withMessage('Valid due date required'),
  body('maxPoints').isInt({ min: 1 }).withMessage('Max points must be at least 1'),
  body('questions').exists().withMessage('Questions required')
], async (req, res) => {
  try {
    console.log('Quiz creation request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, title, description, dueDate, maxPoints, instructions, questions, isQuiz } = req.body;

    console.log('Parsed data:', { courseId, title, description, dueDate, maxPoints, instructions, questions, isQuiz });

    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'faculty' && course.instructor.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id, 'course instructor:', course.instructor);
      return res.status(403).json({ message: 'Access denied' });
    }

    let parsedQuestions;
    try {
      // Check if questions is already an array or needs parsing
      if (Array.isArray(questions)) {
        parsedQuestions = questions;
        console.log('Questions already parsed as array:', parsedQuestions);
      } else {
        parsedQuestions = JSON.parse(questions);
        console.log('Parsed questions from string:', parsedQuestions);
      }
    } catch (parseError) {
      console.error('JSON parse error for questions:', parseError);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Validate questions structure
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return res.status(400).json({ message: 'Questions must be a non-empty array' });
    }

    for (let i = 0; i < parsedQuestions.length; i++) {
      const q = parsedQuestions[i];
      if (!q.type || !q.question || typeof q.question !== 'string' || q.question.trim() === '') {
        return res.status(400).json({ message: `Question ${i + 1}: Invalid type or question text` });
      }

      if (q.type === 'mcq') {
        if (!Array.isArray(q.options) || q.options.length < 2 || q.options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
          return res.status(400).json({ message: `Question ${i + 1}: MCQ must have at least 2 non-empty options` });
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          return res.status(400).json({ message: `Question ${i + 1}: Invalid correct answer index` });
        }
      } else if (q.type === 'fill-blank') {
        if (!q.correctText || typeof q.correctText !== 'string' || q.correctText.trim() === '') {
          return res.status(400).json({ message: `Question ${i + 1}: Fill-in-the-blank must have a non-empty correct answer` });
        }
      } else {
        return res.status(400).json({ message: `Question ${i + 1}: Invalid question type` });
      }
    }

    // Normalize questions to ensure consistent structure
    const normalizedQuestions = parsedQuestions.map(q => {
      const normalized = {
        type: q.type,
        question: q.question
      };
      if (q.type === 'mcq') {
        normalized.options = q.options;
        normalized.correctAnswer = q.correctAnswer;
        normalized.correctText = '';
      } else if (q.type === 'fill-blank') {
        normalized.options = [];
        normalized.correctAnswer = null;
        normalized.correctText = q.correctText;
      }
      return normalized;
    });

    const assignment = new Assignment({
      course: courseId,
      title,
      description,
      dueDate,
      maxPoints,
      instructions,
      isQuiz: isQuiz === 'true',
      questions: normalizedQuestions,
      pdfUrl: '',
      imageUrl: ''
    });

    console.log('Saving assignment:', assignment);
    try {
      await assignment.save();
      console.log('Assignment saved successfully');
    } catch (saveError) {
      console.error('Error saving assignment:', saveError);
      return res.status(500).json({ message: 'Error saving assignment', error: saveError.message });
    }

    // Add assignment to course
    course.assignments.push(assignment._id);
    try {
      await course.save();
      console.log('Course updated successfully');
    } catch (courseSaveError) {
      console.error('Error saving course:', courseSaveError);
      // Rollback: delete the assignment if course save fails
      await Assignment.findByIdAndDelete(assignment._id);
      return res.status(500).json({ message: 'Error updating course', error: courseSaveError.message });
    }

    console.log('Quiz assessment created successfully');
    res.status(201).json({ assignment });
  } catch (error) {
    console.error('Create quiz assessment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignments for a course
router.get('/course/:courseId', authenticateToken, isStudentFacultyOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check access
    const isEnrolled = course.enrolledStudents.some(
      e => e.student.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single assignment
router.get('/:assignmentId', authenticateToken, isStudentFacultyOrAdmin, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('course', 'title instructor')
      .populate('submissions.student', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check access
    const course = await Course.findById(assignment.course);
    const isEnrolled = course.enrolledStudents.some(
      e => e.student.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Update assignment
router.put('/:assignmentId', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.assignmentId,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ assignment: updatedAssignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Delete assignment
router.delete('/:assignmentId', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Assignment.findByIdAndDelete(req.params.assignmentId);
    
    // Remove from course
    await Course.findByIdAndUpdate(assignment.course._id, {
      $pull: { assignments: req.params.assignmentId }
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Submit assignment
router.post('/:assignmentId/submit', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }

    const { submissionText, fileUrl } = req.body;

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    const isEnrolled = course.enrolledStudents.some(
      e => e.student.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Add submission
    assignment.submissions.push({
      student: req.user._id,
      submissionText,
      fileUrl,
      submittedAt: new Date()
    });

    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Submit quiz
router.post('/:assignmentId/submit-quiz', authenticateToken, async (req, res) => {
  try {
    console.log('Quiz submission request received');
    console.log('User:', req.user._id, 'Role:', req.user.role);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    if (req.user.role !== 'student') {
      console.log('User is not a student');
      return res.status(403).json({ message: 'Only students can submit quizzes' });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      console.log('Answers is not an array:', typeof answers);
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    console.log('Finding assignment:', req.params.assignmentId);
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    console.log('Assignment found:', assignment._id, 'isQuiz:', assignment.isQuiz);
    if (!assignment.isQuiz) {
      console.log('Assignment is not a quiz');
      return res.status(400).json({ message: 'This is not a quiz assignment' });
    }

    // Check if student is enrolled in the course
    console.log('Checking course enrollment for course:', assignment.course);
    const course = await Course.findById(assignment.course);
    if (!course) {
      console.log('Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }

    const isEnrolled = course.enrolledStudents.some(
      e => e.student.toString() === req.user._id.toString()
    );

    console.log('Student enrolled:', isEnrolled);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );

    console.log('Existing submission:', !!existingSubmission);
    if (existingSubmission) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    // Validate answers
    console.log('Validating answers. Received:', answers.length, 'Expected:', assignment.questions.length);
    if (answers.length !== assignment.questions.length) {
      return res.status(400).json({ message: `Number of answers (${answers.length}) does not match number of questions (${assignment.questions.length})` });
    }

    // Sort answers by questionIndex to ensure correct order
    const sortedAnswers = answers.sort((a, b) => a.questionIndex - b.questionIndex);
    console.log('Sorted answers:', sortedAnswers);

    // Grade the quiz
    let correctAnswers = 0;
    const gradedAnswers = sortedAnswers.map((answerObj) => {
      const question = assignment.questions[answerObj.questionIndex];
      console.log(`Grading question ${answerObj.questionIndex}:`, {
        type: question.type,
        answer: answerObj.answer,
        correctAnswer: question.correctAnswer,
        correctText: question.correctText
      });

      let isCorrect = false;

      if (question.type === 'mcq') {
        const selectedIndex = parseInt(answerObj.answer);
        isCorrect = selectedIndex === question.correctAnswer;
        console.log(`MCQ result: selected ${selectedIndex}, correct ${question.correctAnswer}, isCorrect: ${isCorrect}`);
      } else if (question.type === 'fill-blank') {
        isCorrect = answerObj.answer.toLowerCase().trim() === question.correctText.toLowerCase().trim();
        console.log(`Fill-blank result: answer "${answerObj.answer}", correct "${question.correctText}", isCorrect: ${isCorrect}`);
      }

      if (isCorrect) correctAnswers++;

      return {
        questionIndex: answerObj.questionIndex,
        answer: answerObj.answer,
        isCorrect
      };
    });

    const grade = Math.round((correctAnswers / assignment.questions.length) * assignment.maxPoints);
    console.log(`Final grade: ${correctAnswers}/${assignment.questions.length} = ${grade}/${assignment.maxPoints}`);

    // Add submission
    const submissionData = {
      student: req.user._id,
      submissionText: JSON.stringify(gradedAnswers),
      submittedAt: new Date(),
      grade
    };

    console.log('Adding submission:', submissionData);
    await Assignment.updateOne(
      { _id: req.params.assignmentId },
      { $push: { submissions: submissionData } }
    );
    console.log('Assignment updated successfully');

    const response = {
      message: 'Quiz submitted successfully',
      grade,
      maxPoints: assignment.maxPoints,
      correctAnswers,
      totalQuestions: assignment.questions.length
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Submit quiz error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Faculty: Grade submission
router.put('/:assignmentId/submissions/:studentId', authenticateToken, isFacultyOrAdmin, [
  body('grade').isInt({ min: 0 }).withMessage('Grade must be a positive number'),
  body('feedback').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { grade, feedback } = req.body;

    const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check ownership
    if (req.user.role === 'faculty' && assignment.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = assignment.submissions.find(
      s => s.student.toString() === req.params.studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    await assignment.save();

    // Update student's assignment record
    await User.findOneAndUpdate(
      { _id: req.params.studentId, 'assignments.assignment': req.params.assignmentId },
      {
        $set: {
          'assignments.$.grade': grade,
          'assignments.$.feedback': feedback
        }
      }
    );

    res.json({ submission });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Get assignment stats
router.get('/faculty/stats', authenticateToken, isFacultyOrAdmin, async (req, res) => {
  try {
    // Get all assignments created by this faculty
    const assignments = await Assignment.find({
      course: { $in: await Course.find({ instructor: req.user._id }).select('_id') }
    });

    const totalAssignments = assignments.length;

    // Count pending submissions (submissions without grade)
    let pendingSubmissions = 0;
    assignments.forEach(assignment => {
      assignment.submissions.forEach(submission => {
        if (!submission.grade && submission.grade !== 0) {
          pendingSubmissions++;
        }
      });
    });

    res.json({
      totalAssignments,
      pendingSubmissions
    });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assignments for student's enrolled courses
router.get('/student/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view assignments' });
    }

    const courses = await Course.find({ 'enrolledStudents.student': req.user._id });
    const courseIds = courses.map(c => c._id);

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's submissions
router.get('/student/submissions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their submissions' });
    }

    const assignments = await Assignment.find({
      'submissions.student': req.user._id
    }).populate('course', 'title');

    const submissions = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === req.user._id.toString()
      );
      return {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          course: assignment.course,
          dueDate: assignment.dueDate,
          maxPoints: assignment.maxPoints
        },
        submission
      };
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
