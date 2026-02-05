const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

async function testProgressTracking() {
  try {
    console.log('Testing Progress Tracking...');

    // Login as student
    console.log('\n1. Logging in as student...');
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@eduspark.com',
      password: 'student123'
    });
    const studentToken = studentLogin.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // Get enrolled courses
    console.log('\n2. Getting enrolled courses...');
    const enrolledResponse = await axios.get(`${API_BASE}/courses/student/enrolled`, { headers: studentHeaders });
    const courses = enrolledResponse.data.courses;

    if (courses.length === 0) {
      console.log('No enrolled courses found. Please enroll in a course first.');
      return;
    }

    const course = courses[0];
    console.log('Using course:', course.title);

    // Get course details to see current progress
    console.log('\n3. Getting course details...');
    const courseResponse = await axios.get(`${API_BASE}/courses/${course._id}`, { headers: studentHeaders });
    const courseData = courseResponse.data.course;

    const studentEnrollment = courseData.enrolledStudents.find(
      e => e.student.toString() === studentLogin.data.user._id.toString()
    );

    console.log('Current progress:', studentEnrollment.progress);

    // Update progress - mark first link as completed
    console.log('\n4. Updating progress...');
    const completedLessons = ['link-0']; // Mark first link as completed

    const progressResponse = await axios.put(`${API_BASE}/courses/${course._id}/progress`, {
      completedLessons
    }, { headers: studentHeaders });

    console.log('Progress update response:', progressResponse.data.message);

    // Verify progress was updated
    console.log('\n5. Verifying progress update...');
    const updatedCourseResponse = await axios.get(`${API_BASE}/courses/${course._id}`, { headers: studentHeaders });
    const updatedCourseData = updatedCourseResponse.data.course;

    const updatedStudentEnrollment = updatedCourseData.enrolledStudents.find(
      e => e.student.toString() === studentLogin.data.user._id.toString()
    );

    console.log('Updated progress:', updatedStudentEnrollment.progress);

    // Check if progress calculation is correct
    const totalLessons = (updatedCourseData.videos || []).length + (updatedCourseData.links || []).length;
    const expectedProgress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

    if (updatedStudentEnrollment.progress.overallProgress === expectedProgress) {
      console.log('✅ Progress calculation is correct!');
    } else {
      console.log('❌ Progress calculation is incorrect!');
      console.log('Expected:', expectedProgress, 'Actual:', updatedStudentEnrollment.progress.overallProgress);
    }

    console.log('\n✅ Progress tracking test completed!');

  } catch (error) {
    console.error('❌ Progress tracking test FAILED:', error.response?.data || error.message);
  }
}

testProgressTracking();
