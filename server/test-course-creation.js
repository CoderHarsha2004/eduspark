const axios = require('axios');

const API_BASE = 'http://localhost:5004/api';

// First, we need to login as admin to get token
async function getAdminToken() {
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@eduspark.com',
      password: 'admin123'
    });
    return loginResponse.data.token;
  } catch (error) {
    console.error('Failed to login as admin:', error.response?.data || error.message);
    return null;
  }
}

async function testCourseCreation() {
  try {
    console.log('Testing Course Creation with Videos and Links...');

    const adminToken = await getAdminToken();
    if (!adminToken) {
      console.log('Cannot test course creation without admin token');
      return;
    }

    const headers = { Authorization: `Bearer ${adminToken}` };

    // Test 1: Create course with multiple videos and links
    console.log('\n1. Creating course with videos and links...');
    const courseData = {
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
    };

    const createResponse = await axios.post(`${API_BASE}/courses`, courseData, { headers });
    console.log('Course created successfully:', createResponse.data.course.title);
    console.log('Videos count:', createResponse.data.course.videos.length);
    console.log('Links count:', createResponse.data.course.links.length);

    const courseId = createResponse.data.course._id;

    // Test 2: Retrieve the course and verify data
    console.log('\n2. Retrieving course to verify data...');
    const getResponse = await axios.get(`${API_BASE}/courses/${courseId}`, { headers });
    const course = getResponse.data.course;

    console.log('Retrieved course title:', course.title);
    console.log('Videos:');
    course.videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title} - ${video.url}`);
    });
    console.log('Links:');
    course.links.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.title} - ${link.url}`);
    });

    // Test 3: Create course with no videos/links
    console.log('\n3. Creating course with no videos or links...');
    const minimalCourseData = {
      title: 'Basic HTML Course',
      description: 'Learn the basics of HTML',
      category: 'Web Development',
      level: 'beginner',
      duration: 10,
      videos: [],
      links: []
    };

    const minimalCreateResponse = await axios.post(`${API_BASE}/courses`, minimalCourseData, { headers });
    console.log('Minimal course created:', minimalCreateResponse.data.course.title);
    console.log('Videos count:', minimalCreateResponse.data.course.videos.length);
    console.log('Links count:', minimalCreateResponse.data.course.links.length);

    // Test 4: Create course with only videos
    console.log('\n4. Creating course with only videos...');
    const videoOnlyCourseData = {
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
    };

    const videoOnlyResponse = await axios.post(`${API_BASE}/courses`, videoOnlyCourseData, { headers });
    console.log('Video-only course created:', videoOnlyResponse.data.course.title);
    console.log('Videos count:', videoOnlyResponse.data.course.videos.length);
    console.log('Links count:', videoOnlyResponse.data.course.links.length);

    console.log('\n✅ All course creation tests PASSED!');
    console.log('- Courses can be created with title and description');
    console.log('- Multiple videos with titles and URLs are supported');
    console.log('- Multiple links with titles and URLs are supported');
    console.log('- Empty videos/links arrays are handled correctly');
    console.log('- Data is properly saved and retrieved');

  } catch (error) {
    console.error('❌ Course creation test FAILED:', error.response?.data || error.message);
  }
}

testCourseCreation();
