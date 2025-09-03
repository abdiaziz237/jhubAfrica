import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import config from "../../config";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [approvedInterests, setApprovedInterests] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
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

        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch user profile data
        const userResponse = await fetch(`${config.API_BASE_URL}/v1/auth/me`, { headers });
        
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const userData = await userResponse.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
          // Use the real points from the database
          setTotalPoints(userData.user.points || 0);
          console.log('Profile: Real user points from database:', userData.user.points);
        } else {
          throw new Error("Invalid user data");
        }

        // Fetch enrolled courses and approved interests
        try {
          console.log('📊 Profile: Fetching courses from:', `${config.API_BASE_URL}/v1/courses/enrolled`);
          const coursesResponse = await fetch(`${config.API_BASE_URL}/v1/dashboard/user/courses`, { headers });
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            console.log('📊 Profile: Raw API response:', coursesData);
            if (coursesData.success && coursesData.data) {
              const allCourses = coursesData.data;
              console.log('📊 Profile: Received all courses:', allCourses.length);
              console.log('📊 Profile: All courses data:', allCourses);
              const enrolled = allCourses.filter(course => !course.approvedOnly);
              const approved = allCourses.filter(course => course.approvedOnly);
              console.log('📊 Profile: Enrolled courses:', enrolled.length);
              console.log('📊 Profile: Approved courses:', approved.length);
              setEnrolledCourses(enrolled);
              setApprovedInterests(approved);
            } else {
              console.log('📊 Profile: API response not successful or no data:', coursesData);
            }
          } else {
            console.error('📊 Profile: Courses API response not ok:', coursesResponse.status);
          }
        } catch (error) {
          console.error('📊 Profile: Error fetching courses:', error);
        }

        // Fetch referral count
        try {
          const referralResponse = await fetch(`${config.API_BASE_URL}/v1/auth/referral-count`, { headers });
          if (referralResponse.ok) {
            const referralData = await referralResponse.json();
            if (referralData.success) {
              setReferralCount(referralData.count || 0);
            }
          }
        } catch (error) {
          console.error('Error fetching referral count:', error);
          // If referral count API doesn't exist, calculate from user data
          setReferralCount(0);
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
                  <span className="stat-value">{totalPoints}</span>
                  <span className="stat-label">Total Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{enrolledCourses.length + approvedInterests.length}</span>
                  <span className="stat-label">Courses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{referralCount}</span>
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
                  <span className="referral-code">{user.referralCode || "Generating..."}</span>
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
                  <span className="stat-number">{referralCount}</span>
                  <span className="stat-label">Total Referrals</span>
              </div>
                <div className="referral-stat">
                  <span className="stat-number">{referralCount * 50}</span>
                  <span className="stat-label">Points Earned</span>
                </div>
                </div>
              </div>
            </div>

          {/* My Courses Section */}
          <div className="courses-card">
            <h3>My Courses</h3>
            <div className="courses-content">
              {enrolledCourses.length > 0 || approvedInterests.length > 0 ? (
                <div className="courses-list">
                  {/* Enrolled Courses */}
                  {enrolledCourses.length > 0 && (
                    <div className="courses-section">
                      <h4 className="section-title">
                        <i className="fas fa-graduation-cap"></i>
                        Enrolled Courses ({enrolledCourses.length})
                      </h4>
                      <div className="courses-grid">
                        {enrolledCourses.slice(0, 3).map((course, index) => (
                          <div key={course._id || course.id || index} className="course-item">
                            <div className="course-info">
                              <h5>{course.title || course.name || 'Untitled Course'}</h5>
                              <p className="course-description">
                                {course.description ? 
                                  (course.description.length > 100 ? 
                                    course.description.substring(0, 100) + '...' : 
                                    course.description) : 
                                  'No description available'
                                }
                              </p>
                              <div className="course-meta">
                                <span className="course-progress">
                                  <i className="fas fa-chart-line"></i>
                                  {course.progress || 0}% Complete
                                </span>
                                <span className="course-status">
                                  <i className="fas fa-circle"></i>
                                  {course.status || 'Active'}
                                </span>
                              </div>
                            </div>
                            <div className="course-actions">
                              <button 
                                className="btn-continue" 
                                onClick={() => navigate(`/courses/${course._id || course.id}`)}
                              >
                                Continue
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {enrolledCourses.length > 3 && (
                        <button 
                          className="btn-view-all" 
                          onClick={() => navigate("/dashboard")}
                        >
                          View All Enrolled Courses ({enrolledCourses.length})
                        </button>
                      )}
                    </div>
                  )}

                  {/* Approved Course Interests */}
                  {approvedInterests.length > 0 && (
                    <div className="courses-section">
                      <h4 className="section-title">
                        <i className="fas fa-check-circle"></i>
                        Approved Interests ({approvedInterests.length})
                      </h4>
                      <div className="courses-grid">
                        {approvedInterests.slice(0, 3).map((interest, index) => (
                          <div key={`approved-${interest._id || index}`} className="course-item approved">
                            <div className="course-info">
                              <h5>{interest.courseTitle}</h5>
                              <p className="course-description">
                                {interest.courseDescription ? 
                                  (interest.courseDescription.length > 100 ? 
                                    interest.courseDescription.substring(0, 100) + '...' : 
                                    interest.courseDescription) : 
                                  'Your interest has been approved!'
                                }
                              </p>
                              <div className="course-meta">
                                <span className="approval-status">
                                  <i className="fas fa-check-circle"></i>
                                  Approved
                                </span>
                                <span className="approval-date">
                                  <i className="fas fa-calendar"></i>
                                  {interest.responseDate ? 
                                    new Date(interest.responseDate).toLocaleDateString() : 
                                    'Recently'
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="course-actions">
                              <button 
                                className="btn-enroll" 
                                onClick={() => navigate(`/courses/${interest.courseId}`)}
                              >
                                Enroll Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {approvedInterests.length > 3 && (
                        <button 
                          className="btn-view-all" 
                          onClick={() => navigate("/dashboard")}
                        >
                          View All Approved Interests ({approvedInterests.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-courses">
                  <i className="fas fa-book-open"></i>
                  <h4>No courses yet</h4>
                  <p>You haven't enrolled in any courses or expressed interest in any courses yet.</p>
                  <button className="btn-primary" onClick={() => navigate("/courses")}>
                    <i className="fas fa-search"></i>
                    Browse Courses
                  </button>
                </div>
              )}
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
