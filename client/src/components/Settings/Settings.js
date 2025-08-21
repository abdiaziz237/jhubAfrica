import React, { useState, useEffect } from "react";
import "./Settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    firstName: "Jane",
    lastName: "Student",
    email: "jane.student@example.com",
    phone: "+254712345678",
    bio: "Digital skills enthusiast currently learning web development and digital marketing through JHUB Africa.",
    avatar: "/images/avatar-placeholder.jpg",
    notifications: {
      email: { courseUpdates: true, promotional: true, accountActivity: true },
      push: { newCourses: true, deadlineReminders: true, pointsEarned: true },
    },
    privacy: { visibility: "public", shareAnalytics: true, partnerOffers: false },
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Load settings from backend
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5001/api/user/settings", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        setUser((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  // Handle avatar update
  const handleUploadAvatar = () => {
    setUser({ ...user, avatar: "https://randomuser.me/api/portraits/women/44.jpg" });
    alert("Profile photo updated successfully!");
  };

  const handleRemoveAvatar = () => {
    setUser({ ...user, avatar: "/images/avatar-placeholder.jpg" });
    alert("Profile photo removed. A default avatar will be shown.");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

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
          <a href="/profile">Profile</a>
        </div>
        <div className="user-menu">
          <div className="user-avatar">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
      </nav>

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <ul className="sidebar-menu">
            <li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
            <li><a href="/my-courses"><i className="fas fa-book-open"></i> My Courses</a></li>
            <li><a href="/achievements"><i className="fas fa-trophy"></i> Achievements</a></li>
            <li><a href="/points"><i className="fas fa-coins"></i> Points Wallet</a></li>
            <li><a href="/referrals"><i className="fas fa-user-plus"></i> Refer Friends</a></li>
            <li><a href="/settings" className="active"><i className="fas fa-cog"></i> Settings</a></li>
            <li><button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="settings-header">
            <h1>Account Settings</h1>
          </div>

          {/* Tabs */}
          <div className="settings-tabs">
            {["profile", "security", "notifications", "privacy", "billing"].map((tab) => (
              <div
                key={tab}
                className={`settings-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2 className="section-title"><i className="fas fa-user"></i> Profile Information</h2>
              <div className="avatar-upload">
                <div className="avatar-preview">
                  <img src={user.avatar} alt="User Avatar" />
                </div>
                <div className="avatar-upload-actions">
                  <button className="btn btn-outline btn-sm" onClick={handleUploadAvatar}>
                    <i className="fas fa-upload"></i> Upload New Photo
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleRemoveAvatar}>
                    <i className="fas fa-trash"></i> Remove Photo
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={user.firstName} readOnly />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={user.lastName} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user.email} readOnly />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={user.phone} readOnly />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea rows="4" value={user.bio} readOnly></textarea>
              </div>

              <button className="btn btn-primary">Save Changes</button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="settings-section">
              <h2 className="section-title"><i className="fas fa-shield-alt"></i> Security Settings</h2>
              <div className="form-group">
                <label>Password</label>
                <p className="device-meta">Last changed 3 months ago</p>
                <button className="btn btn-outline" onClick={() => setShowPasswordForm(true)}>Change Password</button>
              </div>
              {showPasswordForm && (
                <div>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" />
                  </div>
                  <div className="form-group">
                    <button className="btn btn-primary">Update Password</button>
                    <button className="btn btn-outline" onClick={() => setShowPasswordForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="settings-section">
              <h2 className="section-title"><i className="fas fa-bell"></i> Notification Preferences</h2>
              <div className="form-group">
                <label>Email Notifications</label>
                <div className="checkbox-group">
                  <input type="checkbox" checked={user.notifications.email.courseUpdates} readOnly />
                  <label>Course updates and announcements</label>
                </div>
              </div>
              <button className="btn btn-primary">Save Preferences</button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="settings-section">
              <h2 className="section-title"><i className="fas fa-lock"></i> Privacy Settings</h2>
              <div className="form-group">
                <label>Profile Visibility</label>
                <div className="checkbox-group">
                  <input type="radio" checked={user.privacy.visibility === "public"} readOnly />
                  <label>Public</label>
                </div>
                <div className="checkbox-group">
                  <input type="radio" checked={user.privacy.visibility === "private"} readOnly />
                  <label>Private</label>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="settings-section">
              <h2 className="section-title"><i className="fas fa-credit-card"></i> Billing Information</h2>
              <p className="device-meta">You have 1,250 points available (KES 1,250)</p>
              <button className="btn btn-primary"><i className="fas fa-coins"></i> Redeem Points</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
