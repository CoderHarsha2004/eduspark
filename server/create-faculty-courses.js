const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

async function createFacultyCourses() {
  try {
    console.log('Creating courses for existing faculty user...');

    // Login as existing faculty user
    const facultyLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'jane@faculty.com',
      password: 'password123'
    });
    const facultyToken = facultyLogin.data.token;
    const facultyHeaders = { Authorization: `Bearer ${facultyToken}` };

    // Create courses as faculty
    const courses = [
      {
        title: 'Video Production Course',
        description: 'Learn video production techniques',
        category: 'Media',
        level: 'intermediate',
        duration: 25,
        videos: [
          { title: 'Camera Basics', url: 'https://example.com/camera.mp4' },
          { title: 'Lighting Techniques', url: 'https://example.com/lighting.mp4' }
        ],
        links: []
      },
      {
        title: 'Basic HTML Course',
        description: 'Learn the basics of HTML',
        category: 'Web Development',
        level: 'beginner',
        duration: 10,
        videos: [],
        links: []
      },
      {
        title: 'Advanced JavaScript Course',
        description: 'Learn advanced JavaScript concepts with practical examples',
        category: 'Programming',
        level: 'advanced',
        duration: 40,
        videos: [
          { title: 'Introduction to Closures', url: 'https://example.com/video1.mp4' },
          { title: 'Async/Await Deep Dive', url: 'https://example.com/video2.mp4' },
          { title: 'ES6 Modules Explained', url: 'https://example.com/video3.mp4' }
        ],
        links: [
          { title: 'MDN JavaScript Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
          { title: 'JavaScript Info Tutorial', url: 'https://javascript.info/' },
          { title: 'GitHub JavaScript Resources', url: 'https://github.com/topics/javascript' }
        ]
      },
      {
        title: 'C Language Programming',
        description: 'A detailed information of C language which includes Strings, Arrays, Pointers, Structures, File Handling, Memory Management, and more advanced concepts',
        category: 'Programming',
        level: 'beginner',
        duration: 30,
        videos: [
          { title: 'Introduction to C Programming', url: 'https://example.com/c-intro.mp4' },
          { title: 'Variables and Data Types in C', url: 'https://example.com/c-variables.mp4' },
          { title: 'Control Structures in C', url: 'https://example.com/c-control.mp4' }
        ],
        links: [
          { title: 'C Programming Tutorial - GeeksforGeeks', url: 'https://www.geeksforgeeks.org/c-programming-language/' },
          { title: 'Learn C Programming - Programiz', url: 'https://www.programiz.com/c-programming' },
          { title: 'C Language Reference - cppreference.com', url: 'https://en.cppreference.com/w/c' }
        ]
      }
    ];

    for (const course of courses) {
      const createCourseResponse = await axios.post(`${API_BASE}/courses`, course, { headers: facultyHeaders });
      console.log('Course created:', createCourseResponse.data.course.title);
    }

    console.log('All faculty courses created successfully!');

  } catch (error) {
    console.error('Error creating faculty courses:', error.response?.data || error.message);
  }
}

createFacultyCourses();
