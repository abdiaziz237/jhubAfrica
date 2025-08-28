import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
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
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      alert("Referral code copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
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
      <div className="profile-error">
        <h2>No user data found</h2>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="profile">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>My Profile</h1>
            <p className="subtitle">Manage your account and preferences</p>
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

      {/* Profile Content */}
      <div className="profile-container">
        <div className="profile-grid">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span className="avatar-text">{initials}</span>
        </div>
        </div>
            <div className="profile-info">
              <h2>{user.name || "User Name"}</h2>
              <p className="user-email">{user.email}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{user.points || 0}</span>
                  <span className="stat-label">Total Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.courses?.length || 0}</span>
                  <span className="stat-label">Courses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.referrals || 0}</span>
                  <span className="stat-label">Referrals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="info-card">
            <h3>Personal Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user.name || "Not provided"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login</span>
                <span className="info-value">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Today"}
                </span>
                </div>
              </div>
            </div>

          {/* Referral Information */}
          <div className="referral-card">
            <h3>Referral Program</h3>
            <div className="referral-content">
              <div className="referral-code-section">
                <h4>Your Referral Code</h4>
                <div className="code-display">
                  <span className="referral-code">{user.referralCode || "JHUB1234"}</span>
                  <button className="btn-copy" onClick={copyReferralCode}>
                    <i className="fas fa-copy"></i>
                  </button>
              </div>
                <p className="referral-note">
                  Share this code with friends to earn bonus points when they join!
                </p>
                </div>
              <div className="referral-stats">
                <div className="referral-stat">
                  <span className="stat-number">{user.referrals || 0}</span>
                  <span className="stat-label">Total Referrals</span>
              </div>
                <div className="referral-stat">
                  <span className="stat-number">{(user.referrals || 0) * 100}</span>
                  <span className="stat-label">Points Earned</span>
                </div>
                </div>
              </div>
            </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate("/settings")}>
                <i className="fas fa-cog"></i>
                Account Settings
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
