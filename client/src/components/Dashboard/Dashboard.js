import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    courses: 0,
    achievements: 0,
    referrals: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch user info
        const userRes = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userRes.ok) {
          if (userRes.status === 401) {
            throw new Error("Please login again");
          } else if (userRes.status === 403) {
            throw new Error("Email verification required");
          } else {
            throw new Error(`Server error: ${userRes.status}`);
          }
        }
        
        const userData = await userRes.json();
        
        if (!userData.success || !userData.user) {
          throw new Error("Invalid user data received");
        }

        setUser(userData.user);
        
        // Set stats with real user data
        setStats({
          points: userData.user.points || 0,
          courses: (userData.user.courses?.length || 0) + (approvedCourses.length || 0),
          achievements: userData.user.achievements?.length || 0,
          referrals: userData.user.referrals || 0
        });

        // Fetch enrolled courses
        try {
          const coursesRes = await fetch(`${API_BASE_URL}/api/v1/courses/enrolled`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (coursesRes.ok) {
            const coursesData = await coursesRes.json();
            if (coursesData.data) {
              setEnrolledCourses(coursesData.data);
            } else {
              setEnrolledCourses([]);
            }
          } else {
            setEnrolledCourses([]);
          }
        } catch (error) {
          console.error('Error fetching enrolled courses:', error);
          setEnrolledCourses([]);
        }

        // Fetch approved course interests
        try {
          const interestsRes = await fetch(`${API_BASE_URL}/api/v1/courses/interest/approved`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (interestsRes.ok) {
            const interestsData = await interestsRes.json();
            if (interestsData.success && interestsData.data) {
              setApprovedCourses(interestsData.data);
              // Update stats to include approved interests
              setStats(prevStats => ({
                ...prevStats,
                courses: (enrolledCourses.length || 0) + interestsData.data.length
              }));
            } else {
              setApprovedCourses([]);
            }
          } else {
            setApprovedCourses([]);
          }
        } catch (error) {
          console.error('Error fetching approved course interests:', error);
          setApprovedCourses([]);
        }

        // Generate mock recent activity
        const mockActivity = [
          {
            id: 1,
            title: 'Course Enrolled',
            description: 'Successfully enrolled in Digital Literacy Course',
            category: 'Enrollment',
            icon: 'fas fa-book-open',
            color: '#10b981',
            points: 50,
            time: '2 hours ago'
          },
          {
            id: 2,
            title: 'Achievement Unlocked',
            description: 'Completed your first module!',
            category: 'Achievement',
            icon: 'fas fa-trophy',
            color: '#f59e0b',
            points: 100,
            time: '1 day ago'
          }
        ];
        setRecentActivity(mockActivity);

      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, API_BASE_URL]);

  const handleImageError = (e) => {
    // Hide the broken image and show a placeholder div instead
    e.target.style.display = 'none';
    
    // Create or show a placeholder div
    let placeholder = e.target.parentNode.querySelector('.image-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.innerHTML = '<i class="fas fa-image"></i><span>Course Image</span>';
      e.target.parentNode.appendChild(placeholder);
    }
    placeholder.style.display = 'flex';
  };

  const getCourseImage = (course) => {
    // Use existing course images or logo as fallback
    if (course.image && course.image !== 'null' && course.image !== 'undefined') {
      return course.image;
    }
    // Use the existing logo as fallback
    return '/assets/images/logo.png';
  };

  const getCourseTitle = (course) => {
    return course.title || course.name || 'Untitled Course';
  };

  const getCourseDescription = (course) => {
    const desc = course.description || 'No description available';
    // Truncate long descriptions to prevent layout issues
    return desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  };

  const getProgressPercentage = (course) => {
    if (course.completedModules && course.modules) {
      return Math.round((course.completedModules / course.modules) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.firstName || 'Learner'}! 👋</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <div className="user-actions">
            <button className="btn-secondary" onClick={() => navigate('/courses')}>
              <i className="fas fa-search"></i>
              Browse Courses
            </button>
            <button className="btn-primary" onClick={() => navigate('/profile')}>
              <i className="fas fa-user"></i>
              View Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <p className="stat-label">Total Points</p>
              <p className="stat-number">{stats.points}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <p className="stat-label">Enrolled Courses</p>
              <p className="stat-number">{stats.courses}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <p className="stat-label">Achievements</p>
              <p className="stat-number">{stats.achievements}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p className="stat-label">Referrals</p>
              <p className="stat-number">{stats.referrals}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <div className="tab-header">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-line"></i>
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <i className="fas fa-book"></i>
              My Courses
            </button>
            <button 
              className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="fas fa-chart-bar"></i>
              Analytics
            </button>
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => navigate('/profile')}
            >
              <i className="fas fa-user"></i>
              Profile
            </button>
          </div>

          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <h3>Learning Progress</h3>
                <p>Track your progress across all enrolled courses and see your recent achievements.</p>
                
                {enrolledCourses.length > 0 ? (
                  <div className="progress-cards">
                    {enrolledCourses.slice(0, 3).map((course, index) => (
                      <div key={course._id || course.id || index} className="progress-card">
                        <div className="course-image">
                          <img 
                            src={getCourseImage(course)}
                            alt={getCourseTitle(course)}
                            onError={handleImageError}
                          />
                          <div className="progress-overlay">
                            <span className="progress-percentage">In Progress</span>
                          </div>
                        </div>
                        <div className="course-info">
                          <h4>{getCourseTitle(course)}</h4>
                          <p>{getCourseDescription(course)}</p>
                          <div className="course-meta-info">
                            <span className="instructor">
                              <i className="fas fa-user-tie"></i>
                              {course.instructor || 'Instructor TBD'}
                            </span>
                            <span className="modules">
                              <i className="fas fa-book"></i>
                              Course in progress
                            </span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${getProgressPercentage(course)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-book-open"></i>
                    <h4>Ready to start learning?</h4>
                    <p>You haven't enrolled in any courses yet. Browse our course catalog and find something that interests you!</p>
                    <div className="empty-state-actions">
                      <button className="btn-primary" onClick={() => navigate('/courses')}>
                        Browse All Courses
                      </button>
                      <p className="empty-state-note">Discover our wide range of courses and start your learning journey today!</p>
                    </div>
                  </div>
                )}

                {/* Recent Activity Feed */}
                <div className="activity-section">
                  <h3>Recent Activity</h3>
                  {recentActivity.length > 0 ? (
                    <div className="activity-feed">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-icon" style={{ backgroundColor: activity.color }}>
                            <i className={activity.icon}></i>
                          </div>
                          <div className="activity-content">
                            <div className="activity-header">
                              <h4>{activity.title}</h4>
                              <span className="activity-category">{activity.category}</span>
                            </div>
                            <p>{activity.description}</p>
                            <span className="activity-time">{activity.time}</span>
                          </div>
                          <div className="activity-points">
                            <span className="points-badge">+{activity.points}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-history"></i>
                      <h4>Your learning journey starts here</h4>
                      <p>Once you start enrolling in courses and making progress, your activity will appear here!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="courses-tab">
                <div className="courses-header">
                  <h3>My Courses</h3>
                  <div className="courses-summary">
                    <span className="total-courses">{enrolledCourses.length + approvedCourses.length} Total</span>
                    <span className="active-courses">{enrolledCourses.length} Enrolled</span>
                    <span className="approved-courses">{approvedCourses.length} Approved</span>
                  </div>
                </div>
                
                {enrolledCourses.length > 0 || approvedCourses.length > 0 ? (
                  <div className="courses-container">
                    {/* Enrolled Courses Section */}
                    {enrolledCourses.length > 0 && (
                      <div className="courses-section">
                        <h4 className="section-title">
                          <i className="fas fa-graduation-cap"></i>
                          Enrolled Courses
                        </h4>
                        <div className="enrolled-courses">
                          {enrolledCourses.map((course, index) => (
                            <div key={course._id || course.id || index} className="enrolled-course-card">
                              <div className="course-image">
                                <img 
                                  src={getCourseImage(course)}
                                  alt={getCourseTitle(course)}
                                  onError={handleImageError}
                                />
                                <div className="course-status">
                                  <span className={`status-badge ${getProgressPercentage(course) === 100 ? 'completed' : 'enrolled'}`}>
                                    {getProgressPercentage(course) === 100 ? 'Completed' : 'Enrolled'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="course-content">
                                <div className="course-header">
                                  <div className="course-title-section">
                                    <h4>{getCourseTitle(course)}</h4>
                                    <p className="course-description">{getCourseDescription(course)}</p>
                                    <span className="course-category">{course.category || 'General'}</span>
                                  </div>
                                </div>
                                
                                <div className="course-details">
                                  <div className="detail-row">
                                    <span className="instructor">
                                      <i className="fas fa-user-tie"></i>
                                      {course.instructor || 'Instructor TBD'}
                                    </span>
                                    <span className="modules">
                                      <i className="fas fa-book"></i>
                                      {course.completedModules || 0}/{course.modules || 0} modules completed
                                    </span>
                                  </div>
                                  <div className="detail-row">
                                    <span className="last-accessed">
                                      <i className="fas fa-clock"></i>
                                      Last accessed: {course.lastAccessed || 'Recently'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="course-progress">
                                  <div className="progress-info">
                                    <span>Status: Enrolled</span>
                                    <span>Course in progress</span>
                                    <span className="points-info">
                                      {course.points || 250} XP available
                                    </span>
                                  </div>
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill" 
                                      style={{ width: `${getProgressPercentage(course)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="course-actions">
                                  <button className="btn-continue" onClick={() => navigate(`/courses/${course._id || course.id}`)}>
                                    Continue Learning
                                  </button>
                                  <button className="btn-view" onClick={() => navigate(`/courses/${course._id || course.id}`)}>
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approved Course Interests Section */}
                    {approvedCourses.length > 0 && (
                      <div className="courses-section">
                        <h4 className="section-title">
                          <i className="fas fa-check-circle"></i>
                          Approved Course Interests
                        </h4>
                        <p className="section-description">
                          Your interest in these courses has been approved. You can now enroll to start learning!
                        </p>
                        <div className="approved-interests-grid">
                          {approvedCourses.map((interest, index) => (
                            <div key={`approved-${interest._id || index}`} className="approved-interest-card">
                              <div className="interest-image">
                                <img 
                                  src={interest.courseImage || '/assets/images/logo.png'} 
                                  alt={interest.courseTitle}
                                  onError={handleImageError}
                                />
                                <div className="interest-status">
                                  <span className="status-badge approved">
                                    <i className="fas fa-check"></i> Approved
                                  </span>
                                </div>
                              </div>
                              
                              <div className="interest-content">
                                <div className="interest-header">
                                  <h4>{interest.courseTitle}</h4>
                                  <p className="interest-description">
                                    Your interest has been approved by admin. You can now enroll in this course.
                                  </p>
                                  <span className="interest-category">Approved Interest</span>
                                </div>
                                
                                <div className="interest-details">
                                  <div className="detail-row">
                                    <span className="approval-date">
                                      <i className="fas fa-calendar-check"></i>
                                      Approved: {new Date(interest.responseDate || interest.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {interest.adminResponse && (
                                    <div className="detail-row">
                                      <span className="admin-notes">
                                        <i className="fas fa-comment"></i>
                                        {interest.adminResponse}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="interest-actions">
                                  <button className="btn-enroll" onClick={() => navigate(`/courses/${interest.courseId}`)}>
                                    <i className="fas fa-sign-in-alt"></i>
                                    Enroll Now
                                  </button>
                                  <button className="btn-view" onClick={() => navigate(`/courses/${interest.courseId}`)}>
                                    <i className="fas fa-eye"></i>
                                    View Course
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-book-open"></i>
                    <h4>Ready to start learning?</h4>
                    <p>You haven't enrolled in any courses yet. Browse our course catalog and find something that interests you!</p>
                    <div className="empty-state-actions">
                      <button className="btn-primary" onClick={() => navigate('/courses')}>
                        Browse Courses
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="analytics-tab">
                <div className="analytics-header">
                  <h3>Performance Analytics</h3>
                  <p>Track your learning progress and performance metrics</p>
                </div>
                
                <div className="analytics-content">
                  <div className="analytics-section">
                    <h4>Learning Progress Overview</h4>
                    <div className="progress-metrics">
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="metric-content">
                          <h5>Total Learning Time</h5>
                          <span className="metric-value">{(enrolledCourses.length * 2.5).toFixed(1)} hrs</span>
                          <span className="metric-label">Estimated based on course count</span>
                        </div>
                      </div>
                      
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-tasks"></i>
                        </div>
                        <div className="metric-content">
                          <h5>Course Completion Rate</h5>
                          <span className="metric-value">0%</span>
                          <span className="metric-label">No courses completed yet</span>
                        </div>
                      </div>
                      
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-star"></i>
                        </div>
                        <div className="metric-content">
                          <h5>Average Performance</h5>
                          <span className="metric-value">N/A</span>
                          <span className="metric-label">Start learning to see metrics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
