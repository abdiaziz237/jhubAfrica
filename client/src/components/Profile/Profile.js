import React, { useEffect, useState } from "react";
import "./Profile.css";

const API_BASE_URL = "http://localhost:5001"; // update in prod

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser({
          ...data,
          referralCode: data.referralCode || "JHUB1234",
          level: data.level || 3,
          points: data.points || 1250,
          nextLevel: data.nextLevel || 2000,
          coursesCompleted: data.coursesCompleted || 3,
          totalCourses: data.totalCourses || 12,
          achievements: data.achievements || 2,
          referrals: data.referrals || 5,
          referralPoints: data.referralPoints || 500,
          lastLogin: data.lastLogin || "Today at 10:30 AM",
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

  const copyReferral = () => {
    navigator.clipboard.writeText(
      `https://jhubafrica.com/register?ref=${user.referralCode}`
    );
    alert("Referral link copied to clipboard!");
  };

  if (!user) return <p>Loading profile...</p>;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

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
          <a href="/dashboard">Dashboard</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/rewards">Rewards</a>
          <a href="/profile" className="active">
            Profile
          </a>
        </div>

        <div className="user-menu">
          <div className="user-avatar">{initials}</div>
        </div>
      </nav>

      {/* Layout */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <ul className="sidebar-menu">
            <li>
              <a href="/dashboard">
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
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p>
                Level {user.level} Explorer | Joined{" "}
                {user.joined || "March 2023"}
              </p>

              <div className="profile-stats">
                <div className="profile-stat">
                  <h3>{user.points.toLocaleString()}</h3>
                  <p>XP Points</p>
                </div>
                <div className="profile-stat">
                  <h3>{user.coursesCompleted}</h3>
                  <p>Courses</p>
                </div>
                <div className="profile-stat">
                  <h3>{user.referrals}</h3>
                  <p>Referrals</p>
                </div>
              </div>
            </div>
            <button
              className="profile-edit-btn"
              onClick={() => (window.location.href = "/settings")}
            >
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <div className="detail-card">
              <h2>Personal Information</h2>
              <div className="detail-row">
                <div className="detail-label">Full Name</div>
                <div className="detail-value">{user.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email</div>
                <div className="detail-value">{user.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{user.phone || "Not set"}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Location</div>
                <div className="detail-value">
                  {user.location || "Not provided"}
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h2>Learning Progress</h2>
              <div className="detail-row">
                <div className="detail-label">Current Level</div>
                <div className="detail-value">{user.level} Explorer</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">XP Points</div>
                <div className="detail-value">
                  {user.points} / {user.nextLevel} to next level
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Courses Completed</div>
                <div className="detail-value">
                  {user.coursesCompleted} of {user.totalCourses}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Achievements</div>
                <div className="detail-value">
                  {user.achievements} unlocked
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h2>Referral Program</h2>
              <div className="detail-row">
                <div className="detail-label">Referral Code</div>
                <div className="detail-value">
                  <strong>{user.referralCode}</strong>
                  <button
                    onClick={copyReferral}
                    style={{
                      marginLeft: "10px",
                      padding: "3px 8px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <i className="fas fa-copy"></i> Copy
                  </button>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Friends Referred</div>
                <div className="detail-value">{user.referrals}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Referral Points</div>
                <div className="detail-value">
                  {user.referralPoints.toLocaleString()} XP
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Referral Link</div>
                <div className="detail-value">
                  <input
                    type="text"
                    value={`https://jhubafrica.com/register?ref=${user.referralCode}`}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h2>Account Security</h2>
              <div className="detail-row">
                <div className="detail-label">Password</div>
                <div className="detail-value">
                  ******** <a href="/change-password">Change</a>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Two-Factor Auth</div>
                <div className="detail-value">
                  {user.twoFactorEnabled ? "Enabled" : "Not Enabled"}{" "}
                  <a href="/settings#security">Manage</a>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{user.lastLogin}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Account Status</div>
                <div className="detail-value">
                  {user.status || "Active"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
