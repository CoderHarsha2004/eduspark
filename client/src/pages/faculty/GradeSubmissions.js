import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// ...existing code...
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const GradeSubmissions = () => {
  // ...existing code...
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [grading, setGrading] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Get faculty's courses
      const coursesRes = await axios.get('https://eduspark-nxre.onrender.com/api/courses/faculty/my-courses');
      const courses = coursesRes.data.courses;

      // Get assignments for each course
      const assignmentsPromises = courses.map(course =>
        axios.get(`https://eduspark-nxre.onrender.com/api/assignments/course/${course._id}`)
      );

      const assignmentsResponses = await Promise.all(assignmentsPromises);
      const allAssignments = assignmentsResponses.flatMap(res => res.data.assignments);

      // Filter assignments that have submissions
      const assignmentsWithSubmissions = allAssignments.filter(assignment =>
        assignment.submissions.length > 0
      );

      // Add course info
      const assignmentsWithCourseInfo = assignmentsWithSubmissions.map(assignment => {
        const course = courses.find(c => c._id === assignment.course.toString());
        return {
          ...assignment,
          courseTitle: course?.title || 'Unknown Course',
          courseId: course?._id
        };
      });

      setAssignments(assignmentsWithCourseInfo);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setMessage('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (assignmentId, studentId, field, value) => {
    setGrading(prev => ({
      ...prev,
      [`${assignmentId}-${studentId}`]: {
        ...prev[`${assignmentId}-${studentId}`],
        [field]: value
      }
    }));
  };

  const submitGrade = async (assignmentId, studentId) => {
    const gradeData = grading[`${assignmentId}-${studentId}`];
    if (!gradeData || !gradeData.grade) {
      setMessage('Please enter a grade');
      return;
    }

    try {
      await axios.put(`https://eduspark-nxre.onrender.com/api/assignments/${assignmentId}/submissions/${studentId}`, {
        grade: parseInt(gradeData.grade),
        feedback: gradeData.feedback || ''
      });

      setMessage('Grade submitted successfully!');
      setTimeout(() => setMessage(''), 3000);

      // Refresh assignments
      fetchAssignments();

      // Clear grading data
      setGrading(prev => {
        const newGrading = { ...prev };
        delete newGrading[`${assignmentId}-${studentId}`];
        return newGrading;
      });
    } catch (error) {
      console.error('Error submitting grade:', error);
      setMessage('Failed to submit grade');
    }
  };

  const getPendingSubmissionsCount = (assignment) => {
    return assignment.submissions.filter(sub => sub.grade === undefined || sub.grade === null).length;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Grade Submissions
          </h1>
          <p className="text-gray-600">Review and grade student assignment submissions.</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {assignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <span className="text-4xl mb-4 block">✅</span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h4>
              <p className="text-gray-500">
                There are no pending submissions to grade at this time.
              </p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">📚 {assignment.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {getPendingSubmissionsCount(assignment)} pending submission{getPendingSubmissionsCount(assignment) !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setSelectedAssignment(
                        selectedAssignment === assignment._id ? null : assignment._id
                      )}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {selectedAssignment === assignment._id ? 'Hide' : 'View'} Submissions
                    </button>
                  </div>
                </div>

                {selectedAssignment === assignment._id && (
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {assignment.submissions
                        .map((submission) => (
                        <div key={submission._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Student: {submission.student.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              submission.grade === undefined || submission.grade === null
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {submission.grade === undefined || submission.grade === null ? 'Pending Grade' : `Graded: ${submission.grade}/${assignment.maxPoints}`}
                            </span>
                          </div>

                          {assignment.isQuiz ? (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Quiz Answers:</h5>
                              <div className="bg-gray-50 rounded p-3 text-sm">
                                {(() => {
                                  try {
                                    const answers = JSON.parse(submission.submissionText);
                                    return answers.map((answer, idx) => (
                                      <div key={idx} className="mb-2">
                                        <span className="font-medium">Q{idx + 1}:</span> {answer.answer}
                                        {answer.isCorrect !== undefined && (
                                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                            answer.isCorrect
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                          </span>
                                        )}
                                      </div>
                                    ));
                                  } catch (e) {
                                    return <p>{submission.submissionText}</p>;
                                  }
                                })()}
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Submission:</h5>
                              <div className="bg-gray-50 rounded p-3 text-sm">
                                {submission.submissionText || 'No text submission'}
                              </div>
                              {submission.fileUrl && (
                                <p className="text-sm text-blue-600 mt-2">
                                  📎 File attached: {submission.fileUrl}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grade (out of {assignment.maxPoints})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={assignment.maxPoints}
                                value={grading[`${assignment._id}-${submission.student._id}`]?.grade || ''}
                                onChange={(e) => handleGradeChange(
                                  assignment._id,
                                  submission.student._id,
                                  'grade',
                                  e.target.value
                                )}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter grade"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feedback (Optional)
                              </label>
                              <textarea
                                value={grading[`${assignment._id}-${submission.student._id}`]?.feedback || ''}
                                onChange={(e) => handleGradeChange(
                                  assignment._id,
                                  submission.student._id,
                                  'feedback',
                                  e.target.value
                                )}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Provide feedback to the student"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => submitGrade(assignment._id, submission.student._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Submit Grade
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GradeSubmissions;
