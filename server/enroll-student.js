const axios = require('axios');

const API_BASE = 'http://localhost:5003/api';

async function enrollStudentInCourses() {
  try {
    console.log('Enrolling student in courses...');

    // Login as student
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@eduspark.com',
      password: 'student123'
    });
    const studentToken = studentLogin.data.token;
    const headers = { Authorization: `Bearer ${studentToken}` };

    // Get all published courses
    const coursesResponse = await axios.get(`${API_BASE}/courses/published`, { headers });
    const courses = coursesResponse.data.courses;

    console.log(`Found ${courses.length} courses to enroll in`);

    // Enroll in each course
    for (const course of courses) {
      try {
        const enrollResponse = await axios.post(`${API_BASE}/courses/${course._id}/enroll`, {}, { headers });
        console.log(`Enrolled in: ${course.title}`);
      } catch (error) {
        console.error(`Failed to enroll in ${course.title}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('Student enrollment completed!');

  } catch (error) {
    console.error('Error enrolling student:', error.response?.data || error.message);
  }
}

enrollStudentInCourses();
