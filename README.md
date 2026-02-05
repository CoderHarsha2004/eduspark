# E Learning - Admin Managed E-Learning LMS

🎓 A complete E-Learning Learning Management System built with the MERN stack. Features role-based access control with admin-managed user approval system.

## 🚀 Features

### User Roles & Permissions
- **Admin**: Full system control, user management, analytics
- **Faculty**: Course creation, assignment management, student grading
- **Student**: Course enrollment, assignment submission, progress tracking

### Core Functionality
- ✅ Self-registration for Students & Faculty
- ✅ Admin approval workflow (pending/approved/blocked)
- ✅ JWT-based authentication
- ✅ Role-based route protection
- ✅ Course management with video/PDF uploads
- ✅ Assignment creation & submission system
- ✅ Grade management & progress tracking
- ✅ Responsive UI with animations

## 🛠 Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads (future feature)

## 📁 Project Structure

```
E Learning/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── faculty/    # Faculty pages
│   │   │   └── student/    # Student pages
│   │   ├── utils/          # Utility functions
│   │   ├── hooks/          # Custom hooks
│   │   └── index.js        # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── controllers/        # Route controllers
│   ├── config/             # Configuration files
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env                # Environment variables
└── README.md
```

## 🗄 MongoDB Schemas

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['admin', 'faculty', 'student'] (required),
  status: Enum ['pending', 'approved', 'blocked'] (default: 'pending'),
  profile: {
    avatar: String,
    bio: String,
    department: String,
    enrollmentNumber: String
  },
  enrolledCourses: [ObjectId], // References to Course
  createdCourses: [ObjectId],  // References to Course
  assignments: [{
    assignment: ObjectId,     // Reference to Assignment
    submittedAt: Date,
    grade: Number,
    feedback: String
  }],
  notifications: [{
    message: String,
    type: String,
    read: Boolean,
    createdAt: Date
  }],
  timestamps: true
}
```

### Course Schema
```javascript
{
  title: String (required),
  description: String (required),
  instructor: ObjectId (required, ref: 'User'),
  category: String (required),
  thumbnail: String,
  lessons: [{
    title: String,
    description: String,
    videoUrl: String,
    duration: Number,
    order: Number,
    materials: [{
      name: String,
      fileUrl: String,
      type: String
    }]
  }],
  assignments: [ObjectId], // References to Assignment
  enrolledStudents: [{
    student: ObjectId (ref: 'User'),
    enrolledAt: Date,
    progress: {
      completedLessons: [Number],
      overallProgress: Number
    }
  }],
  announcements: [{
    title: String,
    content: String,
    createdBy: ObjectId (ref: 'User'),
    createdAt: Date
  }],
  status: Enum ['draft', 'published', 'archived'] (default: 'draft'),
  tags: [String],
  prerequisites: [String],
  duration: Number,
  level: Enum ['beginner', 'intermediate', 'advanced'],
  timestamps: true
}
```

### Assignment Schema
```javascript
{
  course: ObjectId (required, ref: 'Course'),
  title: String (required),
  description: String (required),
  dueDate: Date (required),
  maxPoints: Number (required),
  instructions: String,
  submissions: [{
    student: ObjectId (ref: 'User'),
    submissionText: String,
    fileUrl: String,
    submittedAt: Date,
    grade: Number,
    feedback: String,
    gradedAt: Date
  }],
  timestamps: true
}
```

## 🔐 Authentication Flow

### Registration Process
1. User registers with name, email, password, role
2. Account created with `status: 'pending'`
3. User receives confirmation message
4. Admin must approve account before login

### Login Process
1. User provides email/password
2. System validates credentials
3. Checks if account is approved
4. Returns JWT token on success
5. Redirects to role-specific dashboard

### Role-Based Access
- **Admin**: Full access to all routes
- **Faculty**: Access to faculty routes + general routes
- **Student**: Access to student routes + general routes

## 🚀 API Routes

### Authentication Routes (`/api/auth`)
```
POST   /register          - User registration
POST   /login             - User login
GET    /profile           - Get user profile
PUT    /profile           - Update user profile
GET    /users             - Admin: Get all users
PUT    /users/:id/status  - Admin: Approve/block user
```

### Course Routes (`/api/courses`)
```
GET    /published         - Get published courses
GET    /:id               - Get course details
POST   /                  - Faculty: Create course
PUT    /:id               - Faculty: Update course
DELETE /:id               - Faculty: Delete course
POST   /:id/enroll        - Student: Enroll in course
GET    /my-courses        - Faculty: Get created courses
```

### Assignment Routes (`/api/assignments`)
```
POST   /                  - Faculty: Create assignment
GET    /course/:courseId  - Get course assignments
GET    /:id               - Get assignment details
PUT    /:id               - Faculty: Update assignment
DELETE /:id               - Faculty: Delete assignment
POST   /:id/submit        - Student: Submit assignment
PUT    /:id/submissions/:studentId - Faculty: Grade submission
GET    /student/submissions - Student: Get submissions
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd E\ Learning/server
npm install
```

Create `.env` file in server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduspark
JWT_SECRET=your_super_secret_jwt_key_here
```

Start MongoDB and run server:
```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

### Frontend Setup
```bash
cd E\ Learning/client
npm install
npm start
```

### Running Both Services
1. Start MongoDB
2. Start backend server (port 5000)
3. Start frontend (port 3000)
4. Access at `http://localhost:3000`

## 🧪 Sample Test Cases

### Authentication Tests
1. **Student Registration**
   - Register with valid details
   - Verify status is 'pending'
   - Attempt login (should fail)
   - Admin approves account
   - Login succeeds

2. **Faculty Registration**
   - Register as faculty
   - Admin approval required
   - Login after approval

3. **Admin Login**
   - Use pre-created admin account
   - Access admin dashboard
   - Approve pending users

### Course Management Tests
1. **Course Creation**
   - Faculty creates course
   - Set to draft initially
   - Publish course
   - Students can view published course

2. **Student Enrollment**
   - Student browses courses
   - Enrolls in course
   - Appears in enrolled courses

### Assignment Tests
1. **Assignment Creation**
   - Faculty creates assignment
   - Sets due date and points
   - Students can view assignment

2. **Submission & Grading**
   - Student submits assignment
   - Faculty views submission
   - Grades assignment
   - Student sees grade

## 🎨 UI/UX Features

### Animations
- Page transitions with Framer Motion
- Loading states with smooth animations
- Hover effects on interactive elements

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Clean, modern interface

### Dashboard Analytics
- Admin: User stats, course metrics
- Faculty: Student enrollment, assignment stats
- Student: Course progress, grade overview

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- CORS configuration
- Secure headers

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Set environment variables
NODE_ENV=production
MONGODB_URI=your_production_mongo_uri
JWT_SECRET=your_secure_jwt_secret

# Start server
npm start
```

### Frontend Deployment
```bash
npm run build
# Deploy build/ folder to hosting service
```

## 📝 Future Enhancements

- File upload system for assignments
- Video streaming for course content
- Real-time notifications
- Discussion forums
- Progress certificates
- Advanced analytics
- Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please create an issue in the repository.

---

**Built with ❤️ using MERN Stack**
