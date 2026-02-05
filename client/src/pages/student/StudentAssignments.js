
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Refresh assignments when component mounts (useful when returning from quiz)
  useEffect(() => {
    const handleFocus = () => fetchAssignments();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchAssignments]);

  const fetchAssignments = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      // Get enrolled courses first
      const coursesRes = await axios.get('https://eduspark-nxre.onrender.com/api/courses/student/enrolled');
      const enrolledCourses = coursesRes.data.courses;

      // Get assignments for each enrolled course
      const assignmentsPromises = enrolledCourses.map(course =>
        axios.get(`https://eduspark-nxre.onrender.com/api/assignments/course/${course._id}`)
      );

      const assignmentsResponses = await Promise.all(assignmentsPromises);
      const allAssignments = assignmentsResponses.flatMap(res => res.data.assignments);

      // Add course info and submission status to each assignment
      const assignmentsWithDetails = allAssignments.map(assignment => {
        const course = enrolledCourses.find(c => c._id === assignment.course.toString());
        const submission = assignment.submissions.find(s => (s.student._id || s.student).toString() === user._id);

        console.log(`Assignment: ${assignment.title}, Submissions:`, assignment.submissions.map(s => ({
          student: s.student.toString(),
          grade: s.grade,
          submittedAt: s.submittedAt
        })));
        console.log(`User ID: ${user._id}, Found submission:`, submission);

        return {
          ...assignment,
          courseTitle: course?.title || 'Unknown Course',
          courseId: course?._id,
          submission,
          status: submission ? (submission.grade !== undefined && submission.grade !== null ? 'graded' : 'submitted') : 'pending'
        };
      });

      setAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'submitted': return '📤';
      case 'graded': return '✅';
      default: return '📝';
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📝 My Assignments
              </h1>
              <p className="text-gray-600">View and submit your course assignments.</p>
            </div>
            <button
              onClick={() => fetchAssignments(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  🔄 Refresh
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Assignments', count: assignments.length },
              { key: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
              { key: 'submitted', label: 'Submitted', count: assignments.filter(a => a.status === 'submitted').length },
              { key: 'graded', label: 'Graded', count: assignments.filter(a => a.status === 'graded').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Assignment List or Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                {assignments.length === 0
                  ? "You don't have any assignments yet. Enroll in courses to see assignments here."
                  : `No ${filter} assignments found.`}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">
                        {assignment.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)} {assignment.status}
                      </span>
                      {assignment.isQuiz && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          Quiz
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{assignment.description}</p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-4">📚 {assignment.courseTitle}</span>
                      <span className="mr-4">📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      <span>⭐ {assignment.maxPoints} points</span>
                    </div>

                    {assignment.submission && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Your Submission</h4>
                        <div className="text-sm text-gray-600">
                          <p>Submitted: {new Date(assignment.submission.submittedAt).toLocaleDateString()}</p>
                          {assignment.submission.grade !== undefined && (
                            <p className="font-medium text-green-600">
                              Grade: {assignment.submission.grade}/{assignment.maxPoints} points
                            </p>
                          )}
                          {assignment.submission.feedback && (
                            <p className="mt-2">Feedback: {assignment.submission.feedback}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6">
                    {assignment.status === 'pending' && (
                      assignment.isQuiz ? (
                        <button
                          onClick={() => navigate(`/assignments/${assignment._id}/take`)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Take Quiz
                        </button>
                      ) : (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          Submit Assignment
                        </button>
                      )
                    )}
                    {assignment.status === 'submitted' && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md">
                        Awaiting Grade
                      </span>
                    )}
                    {assignment.status === 'graded' && (
                      <span className="px-4 py-2 bg-green-100 text-green-600 rounded-md">
                        Graded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentAssignments;
