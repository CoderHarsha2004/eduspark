const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

async function createAssignments() {
  try {
    console.log('Creating assignments for courses...');

    // Login as existing faculty user
    const facultyLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'jane@faculty.com',
      password: 'password123'
    });
    const facultyToken = facultyLogin.data.token;
    const facultyHeaders = { Authorization: `Bearer ${facultyToken}` };

    // Get all courses created by this faculty
    const coursesResponse = await axios.get(`${API_BASE}/courses/faculty`, { headers: facultyHeaders });
    const courses = coursesResponse.data.courses;

    if (courses.length === 0) {
      console.log('No courses found. Please create courses first.');
      return;
    }

    console.log(`Found ${courses.length} courses. Creating assignments...`);

    // Create assignments for each course
    const assignments = [
      {
        title: 'Introduction Assignment',
        description: 'Complete the introductory exercises and submit your work.',
        courseId: courses[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        maxScore: 100,
        instructions: 'Please read the course materials and complete the exercises in the provided document.'
      },
      {
        title: 'Mid-term Project',
        description: 'Create a project demonstrating your understanding of the course concepts.',
        courseId: courses[0]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        maxScore: 200,
        instructions: 'Build a complete project using the concepts learned so far. Include documentation and source code.'
      },
      {
        title: 'Final Assessment',
        description: 'Comprehensive assessment covering all course topics.',
        courseId: courses[0]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        maxScore: 150,
        instructions: 'Answer all questions and provide detailed explanations for your solutions.'
      }
    ];

    // Create assignments for the first course
    for (const assignment of assignments) {
      try {
        const createAssignmentResponse = await axios.post(`${API_BASE}/assignments`, assignment, { headers: facultyHeaders });
        console.log('Assignment created:', createAssignmentResponse.data.assignment.title);
      } catch (error) {
        console.error('Error creating assignment:', assignment.title, error.response?.data || error.message);
      }
    }

    // Create one assignment for each additional course
    for (let i = 1; i < courses.length; i++) {
      const assignment = {
        title: `Course Project ${i + 1}`,
        description: `Project assignment for ${courses[i].title}`,
        courseId: courses[i]._id,
        dueDate: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000).toISOString(),
        maxScore: 100,
        instructions: 'Complete the project requirements and submit your work.'
      };

      try {
        const createAssignmentResponse = await axios.post(`${API_BASE}/assignments`, assignment, { headers: facultyHeaders });
        console.log('Assignment created:', createAssignmentResponse.data.assignment.title);
      } catch (error) {
        console.error('Error creating assignment:', assignment.title, error.response?.data || error.message);
      }
    }

    console.log('All assignments created successfully!');

  } catch (error) {
    console.error('Error creating assignments:', error.response?.data || error.message);
  }
}

createAssignments();
