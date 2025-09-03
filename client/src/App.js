import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// Import components
import Courses from "./components/Courses/Courses";
import CourseDetail from "./components/Courses/CourseDetail";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";

import AdminLogin from "./components/AdminLogin/AdminLogin";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import AdminSettings from "./components/AdminDashboard/AdminSettings";
import AdminAnalytics from "./components/AdminDashboard/AdminAnalytics";
import UserManagement from "./components/AdminDashboard/UserManagement";
import CourseManagement from "./components/AdminDashboard/CourseManagement";
import CourseInterestManagement from "./components/AdminDashboard/CourseInterestManagement";
import WaitlistManagement from "./components/AdminDashboard/WaitlistManagement";
import UserVerificationManagement from "./components/AdminDashboard/UserVerificationManagement";

import Referrals from "./components/Referrals/Referrals";

import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import VerificationStatus from "./components/VerificationStatus/VerificationStatus";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// Professional Home Page
function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>JHUB Learning Platform</span>
          </div>
          <h1 className="hero-title">
            Transform Your Future with
            <span className="gradient-text"> World-Class Certifications</span>
          </h1>
          <p className="hero-description">
            Unlock your potential with industry-leading courses that open doors to global opportunities. 
            Master in-demand skills and earn credentials that employers worldwide recognize and value.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Global Partners</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Students Certified</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link to="/courses" className="cta-button primary">
              <i className="fas fa-rocket"></i>
              Explore Courses
            </Link>
            <Link to="/register" className="cta-button secondary">
              <i className="fas fa-user-plus"></i>
              Get Started Free
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <i className="fas fa-certificate"></i>
            <span>Professional Certifications</span>
          </div>
          <div className="floating-card card-2">
            <i className="fas fa-globe"></i>
            <span>Global Recognition</span>
          </div>
          <div className="floating-card card-3">
            <i className="fas fa-users"></i>
            <span>Expert Instructors</span>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="section-header">
          <h2>Why Choose JHUB Africa?</h2>
          <p>Your gateway to premium global certifications at prices that make sense</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <h3>Incredible Savings</h3>
            <p>Access premium courses at up to 80% off when cohorts fill up</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Zero Risk</h3>
            <p>Join our exclusive waiting list completely free - pay only when your spot is confirmed</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <h3>Internationally Recognized</h3>
            <p>Every certification is backed by authorized global providers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Learn Your Way</h3>
            <p>Study at your own pace on world-class platforms like GMetrix, CertPREP, and Learnkey</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>End-to-End Support</h3>
            <p>Our experts guide you from first interest to final certification</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <h3>Career Advancement</h3>
            <p>Boost your resume and unlock new career opportunities with recognized credentials</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Career?</h2>
          <p>Join thousands of professionals who have already taken the first step towards their future</p>
          <Link to="/register" className="cta-button primary large">
            <i className="fas fa-arrow-right"></i>
            Start Your Journey Today
      </Link>
        </div>
      </div>
    </div>
  );
}

// Navbar component
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <i className="fas fa-crown"></i>
          </div>
          <div className="brand-text">
            <span className="brand-name">JHUB Africa</span>
            <span className="brand-tagline">Courses</span>
          </div>
        </Link>
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
          <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-home"></i>
              <span>Home</span>
          </Link>
          <Link to="/courses" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-graduation-cap"></i>
              <span>Courses</span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
              </Link>
              <Link to="/profile" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
              </Link>
              <Link to="/settings" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
              </Link>
              <Link to="/referrals" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-share-alt"></i>
                  <span>Referrals</span>
              </Link>
              </>
            ) : null}
          </div>
          
          <div className="nav-actions">
            {isLoggedIn ? (
              <button className="navbar-link logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
          ) : (
            <>
                <Link to="/login" className="navbar-link login-btn" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
              </Link>
                <Link to="/register" className="navbar-link register-btn" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-user-plus"></i>
                  <span>Get Started</span>
              </Link>
            </>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Main App
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Admin routes - NO navigation bar - MUST come first */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/new" element={<UserManagement />} />
          <Route path="/admin/users/:userId/edit" element={<UserManagement />} />
          <Route path="/admin/courses" element={<CourseManagement />} />
          <Route path="/admin/courses/new" element={<CourseManagement />} />
          <Route path="/admin/course-interests" element={<CourseInterestManagement />} />
          <Route path="/admin/waitlists" element={<WaitlistManagement />} />
          <Route path="/admin/user-verifications" element={<UserVerificationManagement />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* Public routes - WITH navigation bar */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
            </>
          } />
          <Route path="/courses" element={
            <>
              <Navbar />
              <Courses />
            </>
          } />
          <Route path="/courses/:id" element={
            <>
              <Navbar />
              <CourseDetail />
            </>
          } />
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <Register />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <Dashboard />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Navbar />
              <Profile />
            </>
          } />
          <Route path="/settings" element={
            <>
              <Navbar />
              <Settings />
            </>
          } />
          <Route path="/referrals" element={
            <>
              <Navbar />
              <Referrals />
            </>
          } />

          <Route path="/forgot-password" element={
            <>
              <Navbar />
              <ForgotPassword />
            </>
          } />
          <Route path="/reset-password" element={
            <>
              <Navbar />
              <ResetPassword />
            </>
          } />
          <Route path="/verification-status" element={
            <>
              <Navbar />
              <VerificationStatus />
            </>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
