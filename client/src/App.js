// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CreateAnnouncement from './pages/admin/CreateAnnouncement';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import CreateCourse from './pages/faculty/CreateCourse';
import ManageCourse from './pages/faculty/ManageCourse';
import ManageStudents from './pages/faculty/ManageStudents';
import CreateQuizAssessment from './pages/faculty/CreateQuizAssessment';
// ...existing code...
import GradeSubmissions from './pages/faculty/GradeSubmissions';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignments from './pages/student/StudentAssignments';
import TakeQuiz from './pages/student/TakeQuiz';
import CourseView from './pages/student/CourseView';
import Courses from './pages/Courses';

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/courses/create" element={<CreateCourse />} />
        <Route path="/faculty/courses/:courseId" element={<ManageCourse />} />
        <Route path="/faculty/students" element={<ManageStudents />} />
        <Route path="/faculty/quiz-assessment/create" element={<CreateQuizAssessment />} />

        <Route path="/faculty/grade-submissions" element={<GradeSubmissions />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseView />} />
        <Route path="/assignments" element={<StudentAssignments />} />
        <Route path="/assignments/:assignmentId/take" element={<TakeQuiz />} />
      </Routes>
    </div>
  );
}

export default App;
