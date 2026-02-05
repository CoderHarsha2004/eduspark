const axios = require('axios');

const API_BASE = 'http://localhost:5003/api';

async function testQuizSubmission() {
  try {
    console.log('Testing Quiz Submission Fix...');

    // Login as admin to create test data
    console.log('\n1. Logging in as admin...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eduspark.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Create a test course
    console.log('\n2. Creating test course...');
    const courseResponse = await axios.post(`${API_BASE}/courses`, {
      title: 'Test Course for Quiz',
      description: 'A test course to verify quiz submission',
      category: 'Test'
    }, { headers: adminHeaders });
    const courseId = courseResponse.data.course._id;
    console.log('Course created:', courseId);

    // Create a test faculty user
    console.log('\n3. Creating test faculty...');
    const facultyReg = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Faculty',
      email: 'testfaculty@example.com',
      password: 'password123',
      role: 'faculty'
    });
    const facultyId = facultyReg.data.user._id;
    console.log('Faculty created:', facultyId);

    // Login as faculty
    const facultyLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testfaculty@example.com',
      password: 'password123'
    });
    const facultyToken = facultyLogin.data.token;
    const facultyHeaders = { Authorization: `Bearer ${facultyToken}` };

    // Update course instructor
    await axios.put(`${API_BASE}/courses/${courseId}`, {
      instructor: facultyId
    }, { headers: adminHeaders });

    // Create a quiz assignment
    console.log('\n4. Creating quiz assignment...');
    const quizData = {
      courseId,
      title: 'Test Quiz',
      description: 'A test quiz to verify submission',
      dueDate: '2026-01-28T23:59:59.000Z',
      maxPoints: 10,
      instructions: 'Answer all questions',
      isQuiz: 'true',
      questions: JSON.stringify([
        {
          type: 'mcq',
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1
        },
        {
          type: 'fill-blank',
          question: 'What is the capital of France?',
          correctText: 'Paris'
        }
      ])
    };

    const quizResponse = await axios.post(`${API_BASE}/assignments/quiz`, quizData, { headers: facultyHeaders });
    const assignmentId = quizResponse.data.assignment._id;
    console.log('Quiz created:', assignmentId);

    // Create a test student
    console.log('\n5. Creating test student...');
    const studentReg = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Student',
      email: 'teststudent@example.com',
      password: 'password123',
      role: 'student'
    });
    const studentId = studentReg.data.user._id;
    console.log('Student created:', studentId);

    // Login as student
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teststudent@example.com',
      password: 'password123',
      role: 'student'
    });
    const studentToken = studentLogin.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // Enroll student in course
    await axios.post(`${API_BASE}/courses/${courseId}/enroll`, {}, { headers: studentHeaders });
    console.log('Student enrolled in course');

    // Submit the quiz
    console.log('\n6. Submitting quiz...');
    const submissionData = {
      answers: [
        { questionIndex: 0, answer: '1' }, // Correct answer for MCQ (index 1)
        { questionIndex: 1, answer: 'Paris' } // Correct answer for fill-blank
      ]
    };

    const submitResponse = await axios.post(`${API_BASE}/assignments/${assignmentId}/submit-quiz`, submissionData, { headers: studentHeaders });
    console.log('Quiz submission response:', submitResponse.data);

    // Check if submission was saved
    console.log('\n7. Verifying submission was saved...');
    const assignmentResponse = await axios.get(`${API_BASE}/assignments/${assignmentId}`, { headers: studentHeaders });
    const assignment = assignmentResponse.data.assignment;
    const submission = assignment.submissions.find(s => s.student.toString() === studentId);

    if (submission) {
      console.log('✅ Submission found in database');
      console.log('Grade:', submission.grade);
      console.log('Submitted at:', submission.submittedAt);
      console.log('Submission text:', submission.submissionText);
    } else {
      console.log('❌ Submission NOT found in database');
    }

    // Check assignments list for student
    console.log('\n8. Checking student assignments list...');
    const studentCourses = await axios.get(`${API_BASE}/courses/student/enrolled`, { headers: studentHeaders });
    const enrolledCourses = studentCourses.data.courses;

    for (const course of enrolledCourses) {
      const assignmentsResponse = await axios.get(`${API_BASE}/assignments/course/${course._id}`, { headers: studentHeaders });
      const assignments = assignmentsResponse.data.assignments;

      for (const assignment of assignments) {
        const studentSubmission = assignment.submissions.find(s => s.student.toString() === studentId);
        if (studentSubmission) {
          console.log(`Assignment: ${assignment.title}`);
          console.log(`Status: ${studentSubmission.grade !== undefined ? 'graded' : 'submitted'}`);
          console.log(`Grade: ${studentSubmission.grade}/${assignment.maxPoints}`);
        }
      }
    }

    console.log('\n✅ Quiz submission test completed successfully!');

  } catch (error) {
    console.error('❌ Test FAILED:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

testQuizSubmission();
