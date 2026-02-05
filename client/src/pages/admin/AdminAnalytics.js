import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// ...existing code...
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAnalytics = () => {
  // ...existing code...
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalAssignments: 0,
    userGrowth: [],
    courseStats: [],
    enrollmentTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get all courses with enrollment data
      const [usersRes, coursesRes] = await Promise.all([
        axios.get('https://eduspark-nxre.onrender.com/api/auth/users'),
        axios.get('https://eduspark-nxre.onrender.com/api/courses/admin/all')
      ]);

      const users = usersRes.data.users;
      const courses = coursesRes.data.courses;

      // Calculate analytics
      const totalUsers = users.length;
      const totalCourses = courses.length;
      const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents.length, 0);

      // Calculate user growth based on student enrollments over time
      const enrollmentData = [];
      courses.forEach(course => {
        course.enrolledStudents.forEach(enrollment => {
          enrollmentData.push({
            date: new Date(enrollment.enrolledAt),
            count: 1
          });
        });
      });

      // Group enrollments by month and calculate cumulative growth
      const monthlyEnrollments = {};
      enrollmentData.forEach(enrollment => {
        const monthKey = enrollment.date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyEnrollments[monthKey]) {
          monthlyEnrollments[monthKey] = 0;
        }
        monthlyEnrollments[monthKey] += enrollment.count;
      });

      // Sort months chronologically and calculate cumulative growth
      const sortedMonths = Object.keys(monthlyEnrollments).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
      });

      let cumulativeEnrollments = 0;
      const userGrowth = sortedMonths.map(month => {
        cumulativeEnrollments += monthlyEnrollments[month];
        return {
          month: month.split(' ')[0], // Just the month name
          users: cumulativeEnrollments
        };
      });

      // If no enrollment data, show mock data
      if (userGrowth.length === 0) {
        userGrowth.push(
          { month: 'Jan', users: 0 },
          { month: 'Feb', users: 0 },
          { month: 'Mar', users: 0 },
          { month: 'Apr', users: 0 },
          { month: 'May', users: 0 },
          { month: 'Jun', users: 0 }
        );
      }

      const courseStats = courses.map(course => ({
        title: course.title,
        enrollments: course.enrolledStudents.length,
        instructor: course.instructor?.name || 'Unknown'
      })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5);

      setAnalytics({
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalAssignments: 0, // Would need assignment endpoint
        userGrowth,
        courseStats,
        enrollmentTrends: [] // Would need historical data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
            📊 Platform Analytics
          </h1>
          <p className="text-gray-600">Comprehensive insights into platform performance and usage.</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalAssignments}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-4">
              {analytics.userGrowth.map((data, index) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{data.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${(data.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-sm font-medium text-gray-900">{data.users}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courses by Enrollment</h3>
            <div className="space-y-4">
              {analytics.courseStats.map((course, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-gray-600">by {course.instructor}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-bold text-gray-900">{course.enrollments}</div>
                    <div className="text-xs text-gray-600">students</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Average Enrollments per Course</h4>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalCourses > 0 ? Math.round(analytics.totalEnrollments / analytics.totalCourses) : 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">User Engagement Rate</h4>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalUsers > 0 ? Math.round((analytics.totalEnrollments / analytics.totalUsers) * 100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Platform Health</h4>
            <p className="text-2xl font-bold text-green-600">Excellent</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
