import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, [courseId, fetchCourse]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`https://eduspark-nxre.onrender.com/api/courses/${courseId}`);
      const courseData = response.data.course;
      setCourse(courseData);

      // Check if student is enrolled
      const isEnrolled = courseData.enrolledStudents.some(
        e => e.student._id.toString() === user._id.toString()
      );
      setEnrolled(isEnrolled);

      // Calculate progress if enrolled
      if (isEnrolled) {
        const studentEnrollment = courseData.enrolledStudents.find(
          e => e.student.toString() === user._id.toString()
        );
        if (studentEnrollment && studentEnrollment.progress) {
          const completedLessons = studentEnrollment.progress.completedLessons || [];
          setCompletedLessons(completedLessons);
          const totalLessons = (courseData.videos || []).length + (courseData.links || []).length;
          const progressPercent = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
          setProgress(Math.round(progressPercent));
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post(`https://eduspark-nxre.onrender.com/api/courses/${courseId}/enroll`);
      alert('Successfully enrolled in the course!');
      // Refresh course data to get updated enrollment status
      await fetchCourse();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert(error.response?.data?.message || 'Error enrolling in course');
    }
  };

  const handleMarkCompleted = async (lessonIndex, type) => {
    try {
      const newCompletedLessons = [...completedLessons];
      const lessonKey = `${type}-${lessonIndex}`;

      if (newCompletedLessons.includes(lessonKey)) {
        // Remove if already completed
        newCompletedLessons.splice(newCompletedLessons.indexOf(lessonKey), 1);
      } else {
        // Add if not completed
        newCompletedLessons.push(lessonKey);
      }

      await axios.put(`https://eduspark-nxre.onrender.com/api/courses/${courseId}/progress`, {
        completedLessons: newCompletedLessons
      });

      setCompletedLessons(newCompletedLessons);
      // Recalculate progress
      const totalLessons = (course.videos || []).length + (course.links || []).length;
      const progressPercent = totalLessons > 0 ? (newCompletedLessons.length / totalLessons) * 100 : 0;
      setProgress(Math.round(progressPercent));
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Error updating progress');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-500">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Course Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>👨‍🏫 {course.instructor.name}</span>
                  <span>⏱️ {course.duration} hours</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                </div>
              </div>
              {user?.role === 'student' && (
                <div className="ml-6">
                  {enrolled ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{progress}%</div>
                      <div className="text-sm text-gray-600">Progress</div>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Course Content */}
          {enrolled && (
            <>
              {/* Videos Section */}
              {course.videos && course.videos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow p-6 mb-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Videos</h2>
                  <div className="space-y-3">
                    {course.videos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🎥</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{video.title}</h3>
                            <p className="text-sm text-gray-600">{video.url}</p>
                          </div>
                        </div>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Watch
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Links Section */}
              {course.links && course.links.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow p-6 mb-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Links</h2>
                  <div className="space-y-3">
                    {course.links.map((link, index) => {
                      const isCompleted = completedLessons.includes(`link-${index}`);
                      return (
                        <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => handleMarkCompleted(index, 'link')}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-2xl">🔗</span>
                            <div>
                              <h3 className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>{link.title}</h3>
                              <p className="text-sm text-gray-600">{link.url}</p>
                            </div>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Visit
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Assignments Section */}
              {course.assignments && course.assignments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow p-6 mb-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h2>
                  <div className="space-y-3">
                    {course.assignments.map((assignment) => (
                      <div key={assignment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600">{assignment.description}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/assignments/${assignment._id}/take`)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Take Assignment
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Not Enrolled Message */}
          {!enrolled && user?.role === 'student' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-8 text-center"
            >
              <span className="text-6xl mb-4 block">🔒</span>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Enroll to Access Course Content</h3>
              <p className="text-gray-500 mb-6">Enroll in this course to access videos, links, and assignments.</p>
              <button
                onClick={handleEnroll}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseView;
