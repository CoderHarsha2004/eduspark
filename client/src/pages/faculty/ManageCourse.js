import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const ManageCourse = () => {
  // ...existing code...
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    category: '',
    level: '',
    status: ''
  });
  const [videos, setVideos] = useState([{ title: '', url: '' }]);
  const [links, setLinks] = useState([{ title: '', url: '' }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  // Removed unused assignments state
  const [studentsStats, setStudentsStats] = useState({
    totalEnrolled: 0,
    assignmentsCompleted: 0
  });

  const fetchCourse = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      const course = response.data.course;

      setCourseData({
        title: course.title || '',
        description: course.description || '',
        duration: course.duration || '',
        category: course.category || '',
        level: course.level || '',
        status: course.status || ''
      });

      setVideos(course.videos && course.videos.length > 0 ? course.videos : [{ title: '', url: '' }]);
      setLinks(course.links && course.links.length > 0 ? course.links : [{ title: '', url: '' }]);

      // Calculate student statistics
      const totalEnrolled = course.enrolledStudents ? course.enrolledStudents.length : 0;

      // Calculate completed assignments from populated course data
      let assignmentsCompleted = 0;
      if (course.assignments && course.assignments.length > 0) {
        // Count unique students who have completed at least one assignment
        const completedStudents = new Set();
        course.assignments.forEach(assignment => {
          if (assignment.submissions) {
            assignment.submissions.forEach(submission => {
              if (submission.grade !== undefined && submission.grade !== null) {
                completedStudents.add(submission.student._id || submission.student);
              }
            });
          }
        });
        assignmentsCompleted = completedStudents.size;
      }

      setStudentsStats({
        totalEnrolled,
        assignmentsCompleted
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      setMessage('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [courseId, fetchCourse]);

  const handleCourseDataChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...videos];
    newVideos[index][field] = value;
    setVideos(newVideos);
  };

  const addVideo = () => {
    setVideos([...videos, { title: '', url: '' }]);
  };

  const removeVideo = (index) => {
    if (videos.length > 1) {
      const newVideos = videos.filter((_, i) => i !== index);
      setVideos(newVideos);
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLink = (index) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      setLinks(newLinks);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseData.title.trim() || !courseData.description.trim()) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const filteredVideos = videos.filter(video => video.title.trim() !== '' || video.url.trim() !== '');
      const filteredLinks = links.filter(link => link.title.trim() !== '' || link.url.trim() !== '');

      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        duration: courseData.duration,
        category: courseData.category,
        level: courseData.level,
        status: courseData.status,
        videos: filteredVideos,
        links: filteredLinks
      };

      await axios.put(`/api/courses/${courseId}`, coursePayload);
      setMessage('Course updated successfully!');
      setTimeout(() => navigate('/faculty/dashboard'), 2000);
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Course</h1>
            <p className="text-gray-600">Edit course details and manage URLs</p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Course Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={courseData.title}
                    onChange={(e) => handleCourseDataChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => handleCourseDataChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={courseData.duration}
                      onChange={(e) => handleCourseDataChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={courseData.category}
                      onChange={(e) => handleCourseDataChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      id="level"
                      value={courseData.level}
                      onChange={(e) => handleCourseDataChange('level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={courseData.status}
                    onChange={(e) => handleCourseDataChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Videos Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Course Videos</h2>
                <button
                  type="button"
                  onClick={addVideo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Video
                </button>
              </div>
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                      placeholder="Video title"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      value={video.url}
                      onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                      placeholder="Video URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {videos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Course Links</h2>
                <button
                  type="button"
                  onClick={addLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Link
                </button>
              </div>
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      placeholder="Link title"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      placeholder="Link URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Manage Students Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Students</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Total Students Enrolled</h3>
                  <p className="text-3xl font-bold text-blue-600">{studentsStats.totalEnrolled}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Assignments Completed</h3>
                  <p className="text-3xl font-bold text-green-600">{studentsStats.assignmentsCompleted}</p>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end space-x-4"
            >
              <button
                type="button"
                onClick={() => navigate('/faculty/dashboard')}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating Course...' : 'Update Course'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageCourse;
