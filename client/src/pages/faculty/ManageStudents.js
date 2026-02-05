import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageStudents = () => {
  // Removed unused user variable
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    assignmentsCompleted: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://eduspark-nxre.onrender.com/api/courses/faculty/my-courses');
      const coursesData = response.data.courses;
      setCourses(coursesData);

      // Calculate overall stats
      const totalStudents = coursesData.reduce((sum, course) =>
        sum + course.enrolledStudents.length, 0
      );

      setStats(prev => ({
        ...prev,
        totalStudents,
        totalCourses: coursesData.length
      }));

      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForCourse = async (courseId) => {
    try {
      const response = await axios.get(`https://eduspark-nxre.onrender.com/api/courses/${courseId}`);
      const course = response.data.course;
      setStudents(course.enrolledStudents || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Students</h1>
          <p className="text-gray-600">View and manage students enrolled in your courses</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-900 mb-2">Active Courses</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900 mb-2">Assignments Completed</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.assignmentsCompleted}</p>
          </div>
        </motion.div>

        {/* Course Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Course</h2>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.enrolledStudents.length} students)
              </option>
            ))}
          </select>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Students in {courses.find(c => c._id === selectedCourse)?.title || 'Selected Course'}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {students.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <span className="text-4xl mb-4 block">👥</span>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h4>
                <p className="text-gray-500">Students will appear here once they enroll in this course</p>
              </div>
            ) : (
              students.map((enrollment) => (
                <div key={enrollment.student._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{enrollment.student.name}</h4>
                      <p className="text-sm text-gray-600">{enrollment.student.email}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="mr-4">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          enrollment.student.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {enrollment.student.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Status: {enrollment.student.status}
                      </div>
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

export default ManageStudents;
