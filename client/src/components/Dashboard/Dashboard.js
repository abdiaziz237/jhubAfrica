import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const API_BASE_URL = "http://localhost:5001"; // change in production

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    courses: 0,
    achievements: 0,
    referrals: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch user info
    fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setStats({
          points: data.points || 1250,
          courses: data.courses?.length || 3,
          achievements: data.achievements?.length || 2,
          referrals: data.referrals || 5,
        });
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="JHUB Africa" />
          <span className="logo-text">JHUB Africa</span>
        </div>

        <div className="nav-links">
          <a href="/courses">Courses</a>
          <a href="/dashboard" className="active">
            Dashboard
          </a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/rewards">Rewards</a>
          <a href="/profile">Profile</a>
        </div>

        <div className="user-menu">
          <div className="user-avatar">{initials}</div>
        </div>
      </nav>

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <ul className="sidebar-menu">
            <li>
              <a href="/dashboard" className="active">
                <i className="fas fa-home"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/my-courses">
                <i className="fas fa-book-open"></i> My Courses
              </a>
            </li>
            <li>
              <a href="/achievements">
                <i className="fas fa-trophy"></i> Achievements
              </a>
            </li>
            <li>
              <a href="/points">
                <i className="fas fa-coins"></i> Points Wallet
              </a>
            </li>
            <li>
              <a href="/referrals">
                <i className="fas fa-user-plus"></i> Refer Friends
              </a>
            </li>
            <li>
              <a href="/settings">
                <i className="fas fa-cog"></i> Settings
              </a>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <h1>
              Welcome back, {user?.name ? user.name.split(" ")[0] : "Loading"}!
            </h1>
            <p>Continue your learning journey and earn more points today</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <i className="fas fa-bolt"></i>
              <h3>{stats.points.toLocaleString()} XP</h3>
              <p>Total Points Earned</p>
            </div>

            <div className="stat-card">
              <i className="fas fa-book"></i>
              <h3>{stats.courses}</h3>
              <p>Courses Enrolled</p>
            </div>

            <div className="stat-card">
              <i className="fas fa-trophy"></i>
              <h3>{stats.achievements}</h3>
              <p>Achievements Unlocked</p>
            </div>

            <div className="stat-card">
              <i className="fas fa-users"></i>
              <h3>{stats.referrals}</h3>
              <p>Friends Referred</p>
            </div>
          </div>

          {/* Recent Activity (static demo for now) */}
          <div className="activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <a href="/activity">View All</a>
            </div>

            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="activity-content">
                  <h4 className="activity-title">Course Completed</h4>
                  <p className="activity-desc">IC3 Digital Literacy</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
                <div className="activity-points">+250 XP</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
