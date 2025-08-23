import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// Import components
import Courses from "./components/Courses/Courses";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Admin from "./components/Admin/Admin";
import AdminLogin from "./components/AdminLogin/AdminLogin";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import Referrals from "./components/Referrals/Referrals";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";

// Simple Home Page
function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to JHUB Africa</h1>
      <p>Grow your skills, earn XP, and unlock achievements 🚀</p>
      <Link to="/courses" className="cta-button">
        View Courses
      </Link>
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
          JHUB Africa
        </Link>
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/courses" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Courses
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/profile" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/settings" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Settings
              </Link>
              <Link to="/referrals" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Referrals
              </Link>
              <button className="navbar-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="navbar-link navbar-register" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
          
          <Link to="/admin/login" className="navbar-link admin-link" onClick={() => setIsMenuOpen(false)}>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Main App
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Reset password is only via email link, not shown in navbar */}
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
