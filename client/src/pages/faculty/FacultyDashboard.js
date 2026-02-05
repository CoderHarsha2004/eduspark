import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingSubmissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        axios.get('https://eduspark-nxre.onrender.com/api/courses/faculty/my-courses'),
        axios.get('https://eduspark-nxre.onrender.com/api/assignments/faculty/stats')
      ]);

      const coursesData = coursesRes.data.courses;
      setCourses(coursesData);

      // Calculate stats
      const totalStudents = coursesData.reduce((sum, course) =>
        sum + course.enrolledStudents.length, 0
      );

      const totalAssignments = assignmentsRes.data.totalAssignments || 0;
      const pendingSubmissions = assignmentsRes.data.pendingSubmissions || 0;

      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        totalAssignments,
        pendingSubmissions
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
            👨‍🏫 Welcome back, Professor {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your courses and track student progress.</p>
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
                <p className="text-sm font-medium text-gray-600">My Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
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
              to="/faculty/courses/create"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <h4 className="font-medium text-blue-900">Create New Course</h4>
                <p className="text-sm text-blue-700">Add a new course to your catalog</p>
              </div>
            </Link>

            <Link
              to="/faculty/quiz-assessment/create"
              className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h4 className="font-medium text-indigo-900">Create Quiz Assessment</h4>
                <p className="text-sm text-indigo-700">Create quiz with PDF and image uploads</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* My Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-100 rounded-lg shadow overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
            <Link
              to="/faculty/courses"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {courses.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <span className="text-4xl mb-4 block">📚</span>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h4>
                <p className="text-gray-500 mb-4">Create your first course to get started</p>
                <Link
                  to="/faculty/courses/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Course
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
                        <span className="mr-4">👥 {course.enrolledStudents.length} students</span>
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
                        to={`/faculty/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Enrolled Students Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-100 rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Student Overview</h3>
            <Link
              to="/faculty/students"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage Students →
            </Link>
          </div>
          <div className="p-6">
            {stats.totalStudents === 0 ? (
              <div className="text-center">
                <span className="text-4xl mb-4 block">👥</span>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h4>
                <p className="text-gray-500">Students will appear here once they enroll in your courses</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <div className="text-sm text-gray-600">Total Enrolled Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.totalCourses}</div>
                  <div className="text-sm text-gray-600">Active Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.pendingSubmissions}</div>
                  <div className="text-sm text-gray-600">Pending Reviews</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
