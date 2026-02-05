import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const enrolledResponse = await axios.get('https://eduspark-nxre.onrender.com/api/courses/student/enrolled');
      const enrolledCourses = enrolledResponse.data.courses;
      setCourses(enrolledCourses);

      // Fetch all assignments for enrolled courses
      const allAssignmentsResponse = await axios.get('https://eduspark-nxre.onrender.com/api/assignments/student/all');
      const allAssignments = allAssignmentsResponse.data.assignments;

      // Fetch assignment submissions
      const submissionsResponse = await axios.get('https://eduspark-nxre.onrender.com/api/assignments/student/submissions');
      const submissions = submissionsResponse.data.submissions;

      // Calculate stats
      const enrolledCoursesCount = enrolledCourses.length;
      const completedAssignments = submissions.length; // Count of submitted assignments
      const pendingAssignments = allAssignments.length - submissions.length; // Total assignments minus submitted

      // Calculate average grade
      const gradedSubmissions = submissions.filter(sub => sub.submission.grade !== undefined && sub.submission.grade !== null);
      const averageGrade = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum, sub) => sum + sub.submission.grade, 0) / gradedSubmissions.length)
        : 0;

      setStats({
        enrolledCourses: enrolledCoursesCount,
        completedAssignments,
        pendingAssignments,
        averageGrade
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        enrolledCourses: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        averageGrade: 0
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎓 Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Continue your learning journey and track your progress.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/courses"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">🔍</span>
              <div>
                <h4 className="font-medium text-blue-900">Browse Courses</h4>
                <p className="text-sm text-blue-700">Discover new courses to enroll</p>
              </div>
            </Link>

            <Link
              to="/assignments"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h4 className="font-medium text-green-900">View Assignments</h4>
                <p className="text-sm text-green-700">Check your pending assignments</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* My Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-100 rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
            <Link
              to="/courses"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Browse More →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {courses.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <span className="text-4xl mb-4 block">📚</span>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h4>
                <p className="text-gray-500 mb-4">Enroll in your first course to get started</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              courses.slice(0, 3).map((course) => (
                <div key={course._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{course.description.substring(0, 100)}...</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="mr-4">👨‍🏫 {course.instructor.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
