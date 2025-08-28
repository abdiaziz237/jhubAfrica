import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    learningReminders: true,
    courseUpdates: true,
    achievementAlerts: true,
    referralNotifications: true,
    darkMode: false,
    autoPlay: false,
    soundEffects: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
    const token = localStorage.getItem("authToken");
        
    if (!token) {
          navigate("/login");
      return;
    }

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setEditForm({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            location: data.user.location || ""
          });
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSettingChange = (settingName) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(prev => ({ ...prev, ...editForm }));
          setIsEditing(false);
          alert("Profile updated successfully!");
        }
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
  return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading your settings...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="settings-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
          </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-error">
        <h2>No user data found</h2>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
        </div>
    );
  }

  return (
    <div className="settings">
      {/* Header */}
      <header className="settings-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Account Settings</h1>
            <p className="subtitle">Customize your learning experience</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
                  </button>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
                  </button>
                </div>
              </div>
      </header>

      {/* Settings Content */}
      <div className="settings-container">
        <div className="settings-grid">
          {/* Profile Settings */}
          <div className="settings-card">
            <h3>Profile Information</h3>
            {!isEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user.name || "Not provided"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{user.phone || "Not provided"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{user.location || "Not provided"}</span>
                </div>
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                  />
              </div>
              <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i>
                    Save Changes
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
              </div>

          {/* Notification Settings */}
          <div className="settings-card">
            <h3>Notification Preferences</h3>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive updates about your courses and achievements</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Learning Reminders</h4>
                  <p>Get reminded to continue your courses</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.learningReminders}
                    onChange={() => handleSettingChange('learningReminders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Course Updates</h4>
                  <p>Notifications about new course content</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.courseUpdates}
                    onChange={() => handleSettingChange('courseUpdates')}
                  />
                  <span className="toggle-slider"></span>
                </label>
            </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Achievement Alerts</h4>
                  <p>Celebrate your learning milestones</p>
              </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.achievementAlerts}
                    onChange={() => handleSettingChange('achievementAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                  </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Referral Notifications</h4>
                  <p>Updates about your referral program</p>
                  </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.referralNotifications}
                    onChange={() => handleSettingChange('referralNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                  </div>
                  </div>
                </div>

          {/* Interface Settings */}
          <div className="settings-card">
            <h3>Interface Preferences</h3>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                  <p>Switch to dark theme for better visibility</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={() => handleSettingChange('darkMode')}
                  />
                  <span className="toggle-slider"></span>
                </label>
            </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Auto-play Videos</h4>
                  <p>Automatically play course videos</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={() => handleSettingChange('autoPlay')}
                  />
                  <span className="toggle-slider"></span>
                </label>
            </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Sound Effects</h4>
                  <p>Play sounds for interactions</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={() => handleSettingChange('soundEffects')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                </div>
              </div>
            </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate("/profile")}>
                <i className="fas fa-user"></i>
                View Profile
              </button>
              <button className="btn-secondary" onClick={() => navigate("/referrals")}>
                <i className="fas fa-users"></i>
                Manage Referrals
              </button>
              <button className="btn-secondary" onClick={() => navigate("/courses")}>
                <i className="fas fa-book"></i>
                Browse Courses
              </button>
            </div>
          </div>
            </div>
        </div>
      </div>
  );
}
