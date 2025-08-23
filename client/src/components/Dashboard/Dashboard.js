import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE_URL = "http://localhost:5001";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    courses: 0,
    achievements: 0,
    referrals: 0,
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();
        
        setUser(userData);
        setStats({
          points: userData.points || 1250,
          courses: userData.courses?.length || 3,
          achievements: userData.achievements?.length || 2,
          referrals: userData.referrals || 5,
        });

        // Fetch enrolled courses
        try {
          const coursesRes = await fetch(`${API_BASE_URL}/api/v1/course/enrolled`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (coursesRes.ok) {
            const coursesData = await coursesRes.json();
            setEnrolledCourses(coursesData.data || []);
          }
        } catch (err) {
          console.log("Could not fetch enrolled courses:", err);
        }

        // Fetch recommended courses
        try {
          const recommendedRes = await fetch(`${API_BASE_URL}/api/v1/course?limit=3`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (recommendedRes.ok) {
            const recommendedData = await recommendedRes.json();
            setRecommendedCourses(recommendedData.data || []);
          }
        } catch (err) {
          console.log("Could not fetch recommended courses:", err);
        }

        // Mock recent activity data
        setRecentActivity([
          {
            id: 1,
            type: "course_completed",
            title: "Course Completed",
            description: "IC3 Digital Literacy",
            points: 250,
            time: "2 hours ago",
            icon: "fas fa-book"
          },
          {
            id: 2,
            type: "achievement",
            title: "Achievement Unlocked",
            description: "First Course Completed",
            points: 100,
            time: "1 day ago",
            icon: "fas fa-trophy"
          },
          {
            id: 3,
            type: "referral",
            title: "Friend Referred",
            description: "John Doe joined JHUB",
            points: 50,
            time: "3 days ago",
            icon: "fas fa-user-plus"
          }
        ]);
        
      } catch (err) {
        console.error(err);
        localStorage.removeItem("authToken");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const getProgressPercentage = (course) => {
    return course.progress || Math.floor(Math.random() * 100);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

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
            <div className="welcome-content">
              <h1>
                {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Student"}! 👋
              </h1>
              <p>Continue your learning journey and unlock new achievements</p>
              <div className="quick-actions">
                <button className="action-btn primary" onClick={() => navigate('/courses')}>
                  <i className="fas fa-book"></i>
                  Browse Courses
                </button>
                <button className="action-btn secondary" onClick={() => navigate('/profile')}>
                  <i className="fas fa-user"></i>
                  View Profile
                </button>
              </div>
            </div>
            <div className="welcome-illustration">
              <div className="progress-ring">
                <div className="progress-text">
                  <span className="level">Level {Math.floor(stats.points / 500) + 1}</span>
                  <span className="xp">{stats.points} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card points">
              <div className="stat-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.points.toLocaleString()}</h3>
                <p>Total XP Earned</p>
                <div className="stat-trend">+125 this week</div>
              </div>
            </div>

            <div className="stat-card courses">
              <div className="stat-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.courses}</h3>
                <p>Courses Enrolled</p>
                <div className="stat-trend">{enrolledCourses.filter(c => getProgressPercentage(c) < 100).length} in progress</div>
              </div>
            </div>

            <div className="stat-card achievements">
              <div className="stat-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.achievements}</h3>
                <p>Achievements</p>
                <div className="stat-trend">2 more to unlock</div>
              </div>
            </div>

            <div className="stat-card referrals">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.referrals}</h3>
                <p>Friends Referred</p>
                <div className="stat-trend">Earn 50 XP per referral</div>
              </div>
            </div>
          </div>

          {/* Dashboard Content Grid */}
          <div className="dashboard-grid">
            {/* Current Courses */}
            <div className="dashboard-section current-courses">
              <div className="section-header">
                <h2>Continue Learning</h2>
                <button className="view-all-btn" onClick={() => navigate('/my-courses')}>
                  View All
                </button>
              </div>
              
              <div className="courses-list">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.slice(0, 3).map((course) => {
                    const progress = getProgressPercentage(course);
                    return (
                      <div key={course._id} className="course-progress-card">
                        <div className="course-info">
                          <h4>{course.title}</h4>
                          <p>{course.instructor?.name || 'Unknown Instructor'}</p>
                        </div>
                        <div className="progress-section">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{progress}%</span>
                        </div>
                        <button className="continue-btn">
                          {progress === 100 ? 'Review' : 'Continue'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-book-open"></i>
                    <p>No courses enrolled yet</p>
                    <button className="enroll-btn" onClick={() => navigate('/courses')}>
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="dashboard-section recommended-courses">
              <div className="section-header">
                <h2>Recommended for You</h2>
                <button className="view-all-btn" onClick={() => navigate('/courses')}>
                  View All
                </button>
              </div>
              
              <div className="recommended-list">
                {recommendedCourses.slice(0, 3).map((course) => (
                  <div key={course._id} className="recommended-card">
                    <div className="course-thumbnail">
                      {course.image ? (
                        <img src={course.image} alt={course.title} />
                      ) : (
                        <div className="placeholder-thumbnail">
                          <i className="fas fa-play"></i>
                        </div>
                      )}
                    </div>
                    <div className="course-details">
                      <h4>{course.title}</h4>
                      <p>{course.instructor?.name || 'Unknown Instructor'}</p>
                      <div className="course-meta">
                        <span className="duration">
                          <i className="fas fa-clock"></i>
                          {course.duration || '4 weeks'}
                        </span>
                        <span className="level">
                          <i className="fas fa-signal"></i>
                          {course.level || 'Beginner'}
                        </span>
                      </div>
                    </div>
                    <button className="enroll-recommended-btn">
                      Enroll
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <button className="view-all-btn">
                  View All
                </button>
              </div>

              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <i className={activity.icon}></i>
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">{activity.title}</h4>
                      <p className="activity-desc">{activity.description}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                    <div className="activity-points">+{activity.points} XP</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-section quick-stats">
              <div className="section-header">
                <h2>This Week</h2>
              </div>
              
              <div className="weekly-stats">
                <div className="weekly-stat">
                  <div className="stat-value">12h 30m</div>
                  <div className="stat-label">Time Spent Learning</div>
                </div>
                <div className="weekly-stat">
                  <div className="stat-value">8</div>
                  <div className="stat-label">Lessons Completed</div>
                </div>
                <div className="weekly-stat">
                  <div className="stat-value">3</div>
                  <div className="stat-label">Streak Days</div>
                </div>
              </div>
              
              <div className="achievement-preview">
                <h3>Next Achievement</h3>
                <div className="achievement-card">
                  <i className="fas fa-fire"></i>
                  <div>
                    <h4>7-Day Streak</h4>
                    <p>Complete lessons for 7 days in a row</p>
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '43%' }}></div>
                      </div>
                      <span>3/7 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
