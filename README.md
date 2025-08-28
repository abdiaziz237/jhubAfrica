# 🚀 JHUB Africa - Learning Platform

A comprehensive learning management system built with React and Node.js, designed to provide quality education and skill development opportunities.

## ✨ Features

### 🎓 Learning Management
- **Course Catalog**: Browse and enroll in various courses
- **Progress Tracking**: Monitor your learning journey
- **Achievement System**: Earn points and unlock achievements
- **Interactive Learning**: Engaging course content and assessments

### 👤 User Experience
- **Personal Dashboard**: Track progress, achievements, and stats
- **Profile Management**: Customize your learning profile
- **Settings & Preferences**: Tailor your learning experience
- **Referral Program**: Invite friends and earn rewards

### 🔐 Security & Authentication
- **Secure Login/Register**: JWT-based authentication
- **Password Management**: Forgot password and reset functionality
- **Admin Panel**: Comprehensive admin dashboard for course management

### 📱 Responsive Design
- **Mobile-First**: Optimized for all devices
- **Modern UI/UX**: Clean, professional interface
- **Accessibility**: Inclusive design principles

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **CSS3**: Custom styling with responsive design
- **Font Awesome**: Icon library

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **Nodemailer**: Email services

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jhub
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
Create `.env` files in both `server/` and `client/` directories:

#### Server (.env)
```env
PORT=5001
MONGO_URI=mongodb+srv://jhubadmin:admin1234@cluster0.blbkroq.mongodb.net/jhub?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tls=true&tlsAllowInvalidCertificates=true
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=development
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_NAME=JHUB Africa
REACT_APP_VERSION=1.0.0
```

### 4. Database Setup
```bash
# Start MongoDB (if not running as a service)
mongod

# Seed initial data (optional)
cd server
npm run seed
```

### 5. Start Development Servers
```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend development server
cd client
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3000/admin/login

## 📁 Project Structure

```
jhub/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── assets/        # Images, fonts, etc.
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   └── server.js          # Main server file
└── README.md
```

## 🔧 Available Scripts

### Server
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run seed         # Seed database with sample data
npm run test         # Run tests
```

### Client
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run eject        # Eject from Create React App
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses/enroll` - Enroll in course
- `GET /api/v1/courses/enrolled` - Get enrolled courses

### Admin
- `GET /api/v1/admin/courses` - Get all courses (admin)
- `POST /api/v1/admin/courses` - Create course (admin)
- `PUT /api/v1/admin/courses/:id` - Update course (admin)
- `DELETE /api/v1/admin/courses/:id` - Delete course (admin)

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the build/ folder
```

### Backend Deployment (Heroku/Railway)
```bash
cd server
# Set environment variables in deployment platform
# Deploy the server/ folder
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data sanitization
- **CORS Protection**: Cross-origin resource sharing
- **Helmet Security**: Security headers middleware

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@jhubafrica.com
- 💬 Discord: [JHUB Africa Community](https://discord.gg/jhubafrica)
- 📖 Documentation: [docs.jhubafrica.com](https://docs.jhubafrica.com)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Express.js team for the web framework
- All contributors and supporters

---

