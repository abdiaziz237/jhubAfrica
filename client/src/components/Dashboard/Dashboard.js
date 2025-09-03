import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import config from '../../config';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    achievements: 0,
    referrals: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [approvedInterests, setApprovedInterests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  
  const navigate = useNavigate();





  // Fetch dashboard data
  const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

        // Fetch user info
      const userRes = await axios.get(`${config.API_BASE_URL}/v1/auth/me`, { headers });
      
      if (!userRes.data.success || !userRes.data.user) {
          throw new Error("Invalid user data received");
        }

      const userData = userRes.data.user;
      setUser(userData);

        // Fetch enrolled courses and approved interests from database
      let enrolledData = [];
      let approvedData = [];
      
      try {
        // Get enrolled courses from database
        const enrolledRes = await axios.get(`${config.API_BASE_URL}/v1/courses/enrolled`, { headers });
        if (enrolledRes.data.success && enrolledRes.data.data) {
          enrolledData = enrolledRes.data.data;
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }

      try {
        // Get approved course interests from database
        const approvedRes = await axios.get(`${config.API_BASE_URL}/v1/courses/interest/approved`, { headers });
        if (approvedRes.data.success && approvedRes.data.data) {
          approvedData = approvedRes.data.data;
        }
      } catch (error) {
        console.error('Error fetching approved interests:', error);
      }

      // Fetch user activity
      let activityData = [];
      try {
        const activityRes = await axios.get(`${config.API_BASE_URL}/v1/dashboard/user/activity`, { headers });
        if (activityRes.data.success && activityRes.data.data) {
          activityData = activityRes.data.data;
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      }

      // Fetch referral count
      let referralCount = 0;
      try {
        const referralRes = await axios.get(`${config.API_BASE_URL}/v1/auth/referral-count`, { headers });
        if (referralRes.data.success) {
          referralCount = referralRes.data.count || 0;
        }
      } catch (error) {
        // No referral count found
      }

      // Points are now fetched directly from user data (same as profile)
      // No need for separate points summary API call

      setEnrolledCourses(enrolledData);
      setApprovedInterests(approvedData);
      setRecentActivity(activityData);

      // Calculate real-time stats from actual data
      const completedCourses = enrolledData.filter(course => course.enrollmentStatus === 'completed').length;
      const activeCourses = enrolledData.filter(course => course.enrollmentStatus === 'active').length;
      
      // Learning time calculation removed for simplicity

      // Use points directly from database (same as profile component)
      const totalPoints = userData.points || 0;
      console.log('Dashboard: Using user.points from database:', totalPoints);

      // Get achievements count from user data or calculate from completed courses
      const achievements = completedCourses + (userData.achievements?.length || 0);

      // Get referrals count
      const referrals = referralCount;

      // If no real data, show some encouraging defaults for new users
      if (enrolledData.length === 0 && approvedData.length === 0) {
        // No courses found - showing welcome stats for new user
        setStats({
          points: totalPoints || 50, // Welcome bonus
          enrolledCourses: 0,
          completedCourses: 0,
          achievements: 1, // Welcome achievement
          referrals: referrals
        });
      } else {
        setStats({
          points: totalPoints,
          enrolledCourses: enrolledData.length, // Only actual enrolled courses
          completedCourses,
          achievements,
          referrals
        });
      }

    } catch (error) {
      // Dashboard error occurred
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);



  // Handle image errors
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    let placeholder = e.target.parentNode.querySelector('.image-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.innerHTML = '<i class="fas fa-image"></i><span>Course Image</span>';
      e.target.parentNode.appendChild(placeholder);
    }
    placeholder.style.display = 'flex';
  };

  // Get course image with fallback
  const getCourseImage = (course) => {
    if (course.image && course.image !== 'null' && course.image !== 'undefined') {
      return course.image;
    }
    return '/assets/images/logo.png';
  };

  const getDefaultCourseImage = (courseTitle) => {
    const title = courseTitle?.toLowerCase() || '';
    if (title.includes('swift') || title.includes('ios')) {
      return '/assets/images/swift-course.jpg';
    } else if (title.includes('hello world') || title.includes('programming')) {
      return '/assets/images/programming-course.jpg';
    } else if (title.includes('web') || title.includes('javascript')) {
      return '/assets/images/web-course.jpg';
    } else if (title.includes('python')) {
      return '/assets/images/python-course.jpg';
    } else {
      return '/assets/images/default-course.jpg';
    }
  };

  // Get course title
  const getCourseTitle = (course) => {
    return course.title || course.name || course.courseTitle || 'Untitled Course';
  };

  // Get course description
  const getCourseDescription = (course) => {
    const desc = course.description || 'No description available';
    return desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  };

  // Calculate progress percentage
  const getProgressPercentage = (course) => {
    if (course.progress !== undefined) {
      return Math.round(course.progress);
    }
    if (course.completedModules && course.modules) {
      return Math.round((course.completedModules / course.modules) * 100);
    }
    return 0;
  };

  // Calculate learning streak from activity data
  const calculateLearningStreak = () => {
    if (!recentActivity || recentActivity.length === 0) {
      return 0;
    }

    // Filter learning activities (enrollments, completions, etc.)
    const learningActivities = recentActivity.filter(activity => 
      activity.title === 'Course Enrolled' || 
      activity.title === 'Course Completed' ||
      activity.title === 'Lesson Completed' ||
      activity.title === 'Quiz Completed'
    );

    if (learningActivities.length === 0) {
      return 0;
    }

    // Sort activities by date (most recent first)
    const sortedActivities = learningActivities.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Calculate consecutive days
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedActivities.length; i++) {
      const activityDate = new Date(sortedActivities[i].createdAt);
      activityDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="dashboard">
      <div className="dashboard-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={refreshDashboard}>
              <i className="fas fa-redo"></i>
          Try Again
        </button>
            <button className="btn-secondary" onClick={() => navigate('/courses')}>
              <i className="fas fa-search"></i>
              Browse Courses
            </button>
          </div>
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
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋</h1>
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
            <button className="btn-refresh" onClick={refreshDashboard} title="Refresh Dashboard">
              <i className="fas fa-sync-alt"></i>
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
              <p className="stat-number">{stats.points.toLocaleString()}</p>
              <p className="stat-change">
                {stats.points > 0 ? `Earned from ${enrolledCourses.length} enrollments` : 'Start earning points!'}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <p className="stat-label">Enrolled Courses</p>
              <p className="stat-number">{stats.enrolledCourses}</p>
              <p className="stat-change">
                {stats.completedCourses > 0 ? `${stats.completedCourses} completed` : stats.enrolledCourses > 0 ? 'Start your learning journey!' : 'Enroll in courses to begin'}
              </p>
            </div>
              </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <p className="stat-label">Achievements</p>
              <p className="stat-number">{stats.achievements}</p>
              <p className="stat-change">
                {stats.achievements > 0 ? 'Great job!' : 'Complete courses to unlock achievements'}
              </p>
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
            className={`tab-button ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <i className="fas fa-gift"></i>
            Rewards
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
                <div className="overview-header">
                <h3>Learning Progress</h3>
                <p>Track your progress across all enrolled courses and see your recent achievements.</p>
                </div>
                
                <div className="empty-state">
                  <i className="fas fa-graduation-cap"></i>
                  <h4>Your learning journey starts here</h4>
                  <p>Once you start enrolling in courses and making progress, your activity will appear here!</p>
                </div>

              {/* Recent Activity Feed */}
              <div className="activity-section">
                  <div className="activity-header">
                <h3>Recent Activity</h3>
                    <button className="btn-refresh-small" onClick={refreshDashboard}>
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                  
                {recentActivity.length > 0 ? (
                  <div className="activity-feed">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-icon" style={{ backgroundColor: activity.color || '#2563eb' }}>
                            <i className={activity.icon || 'fas fa-info-circle'}></i>
                         </div>
                        <div className="activity-content">
                          <div className="activity-header">
                              <h4>{activity.title}</h4>
                              <span className="activity-category">{activity.category}</span>
                       </div>
                            <p>{activity.description}</p>
                            <span className="activity-time">{formatTimeAgo(activity.time)}</span>
                         </div>
                          {activity.points && (
                        <div className="activity-points">
                            <span className="points-badge">+{activity.points}</span>
                       </div>
                          )}
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
                  <span className="total-courses">{enrolledCourses.length + approvedInterests.length} Total</span>
                  <span className="active-courses">{enrolledCourses.length} Enrolled</span>
                  <span className="approved-courses">{approvedInterests.length} Approved</span>
                </div>
              </div>
              
              {enrolledCourses.length > 0 || approvedInterests.length > 0 ? (
                <div className="courses-container">
                  {/* Enrolled Courses */}
                  {enrolledCourses.length > 0 && (
                    <div className="courses-section">
                      <h4 className="section-title">
                        <i className="fas fa-graduation-cap"></i>
                        Enrolled Courses
                      </h4>
                      <div className="courses-grid">
                        {enrolledCourses.map((course, index) => {
                          console.log('Enrolled Course Data:', course);
                          return (
                          <div key={course._id || course.id || index} className="course-card">
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
                              <h4 className="course-title">{getCourseTitle(course) || course.title || 'Course Title'}</h4>
                              <p className="course-description">{getCourseDescription(course) || course.description || 'Course description not available'}</p>
                              
                              <div className="course-meta">
                                <span className="progress">
                                  <i className="fas fa-chart-line"></i>
                                  {getProgressPercentage(course)}% Complete
                                </span>
                                <span className="enrollment-date">
                                  <i className="fas fa-calendar"></i>
                                  Enrolled: {course.enrollmentDate ? new Date(course.enrollmentDate).toLocaleDateString() : (course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently')}
                                </span>
                              </div>
                              
                              <div className="course-progress">
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill" 
                                    style={{ width: `${getProgressPercentage(course)}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="course-actions">
                                <button 
                                  className="btn-continue" 
                                  onClick={() => navigate(`/courses/${course._id || course.id}`)}
                                >
                                  Continue Learning
                                </button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Approved Course Interests */}
                  {approvedInterests.length > 0 && (
                    <div className="courses-section">
                      <h4 className="section-title">
                        <i className="fas fa-check-circle"></i>
                        Approved Course Interests
                      </h4>
                      <p className="section-description">
                        Your interest in these courses has been approved. You can now enroll to start learning!
                      </p>
                      <div className="courses-grid">
                        {approvedInterests.map((interest, index) => {
                          console.log('Approved Interest Data:', interest);
                          return (
                          <div key={`approved-${interest._id || index}`} className="course-card approved">
                            <div className="course-image">
                              {interest.courseImage || interest.image ? (
                                <img 
                                  src={interest.courseImage || interest.image} 
                                  alt={interest.courseTitle || interest.title || 'Course'}
                                  onError={handleImageError}
                                />
                              ) : (
                                <span>{interest.courseTitle || interest.title || 'Course'}</span>
                              )}
                              <div className="course-status">
                                <span className="status-badge approved">
                                  <i className="fas fa-check"></i> Approved
                                </span>
                              </div>
                            </div>
                            
                            <div className="course-content">
                              <h4 className="course-title">{interest.courseTitle || interest.title || 'Course Title'}</h4>
                              <p className="course-description">
                                {interest.courseDescription || interest.description || `Your interest in ${interest.courseTitle || interest.title || 'this course'} has been approved. Start your learning journey today!`}
                              </p>
                              
                              <div className="course-meta">
                                <span className="approval-date">
                                  <i className="fas fa-calendar"></i>
                                  Approved: {interest.responseDate ? new Date(interest.responseDate).toLocaleDateString() : (interest.updatedAt ? new Date(interest.updatedAt).toLocaleDateString() : 'Pending')}
                                </span>
                              </div>
                              
                              <div className="course-actions">
                                <button 
                                  className="btn-enroll" 
                                  disabled={enrollingCourseId === (interest.approvedInterestId || interest._id)}
                                  onClick={async () => {
                                    try {
                                      console.log('🎯 Enrolling in approved course:', interest);
                                      
                                      const interestId = interest.approvedInterestId || interest._id;
                                      if (!interestId) {
                                        alert('Interest ID is missing. Cannot enroll.');
                                        return;
                                      }

                                      // Set loading state
                                      setEnrollingCourseId(interestId);

                                      // Get auth token and create headers
                                      const token = localStorage.getItem("authToken");
                                      const headers = { 
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                      };

                                      // Call the enrollment API
                                      const response = await axios.post(
                                        `${config.API_BASE_URL}/v1/courses/interest/${interestId}/enroll`,
                                        {},
                                        { headers }
                                      );

                                      if (response.data.success) {
                                        alert(`Successfully enrolled in ${interest.courseTitle || interest.title}! You earned ${response.data.data.pointsEarned} points.`);
                                        // Refresh the dashboard to show updated data
                                        refreshDashboard();
                                      } else {
                                        alert(`Enrollment failed: ${response.data.message}`);
                                      }
                                    } catch (error) {
                                      console.error('Enrollment error:', error);
                                      const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
                                      alert(`Enrollment failed: ${errorMessage}`);
                                    } finally {
                                      // Clear loading state
                                      setEnrollingCourseId(null);
                                    }
                                  }}
                                >
                                  <i className={`fas ${enrollingCourseId === (interest.approvedInterestId || interest._id) ? 'fa-spinner fa-spin' : 'fa-sign-in-alt'}`}></i>
                                  {enrollingCourseId === (interest.approvedInterestId || interest._id) ? 'Enrolling...' : 'Enroll Now'}
                                </button>
                                <button 
                                  className="btn-view" 
                                  onClick={() => {
                                    console.log('🎯 Approved interest object:', interest);
                                    console.log('🎯 Course ID:', interest.courseId || interest.course?._id || interest._id);
                                    const courseId = interest.courseId || interest.course?._id || interest._id;
                                    if (courseId) {
                                      navigate(`/courses/${courseId}`);
                                    } else {
                                      alert('Course ID is missing. Cannot view course.');
                                    }
                                  }}
                                >
                                  <i className="fas fa-eye"></i>
                                  View Course
                                </button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-book-open"></i>
                  <h4>Ready to start learning?</h4>
                  <p>You haven't enrolled in any courses yet. Browse our course catalog and find something that interests you!</p>
                  <button className="btn-primary" onClick={() => navigate('/courses')}>
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Points & Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="rewards-tab">
              <div className="rewards-header">
                <h3>Your Rewards & Achievements</h3>
                <p>You've been working hard! Here's how you can use your points to unlock special benefits and continue your learning journey.</p>
              </div>
              
              <div className="rewards-content">
                {/* Current Points Status */}
                <div className="points-status-card">
                  <div className="points-display">
                    <div className="points-number">{stats.points}</div>
                    <div className="points-label">Total Points</div>
                  </div>
                  <div className="points-tier">
                    <div className="tier-badge">
                      {stats.points >= 15000 ? 'Diamond' : 
                       stats.points >= 8000 ? 'Platinum' : 
                       stats.points >= 4000 ? 'Gold' : 
                       stats.points >= 2000 ? 'Silver' : 'Bronze'}
                    </div>
                    <div className="tier-description">
                      {stats.points >= 15000 ? 'Elite Member - All Premium Benefits' :
                       stats.points >= 8000 ? 'Premium Member - Advanced Benefits' :
                       stats.points >= 4000 ? 'Gold Member - Enhanced Benefits' :
                       stats.points >= 2000 ? 'Silver Member - Standard Benefits' : 'Bronze Member - Basic Benefits'}
                    </div>
                  </div>
                </div>





                {/* Rewards Categories */}
                <div className="rewards-grid">
                  {/* Learning Rewards */}
                  <div className="reward-category">
                    <h4><i className="fas fa-graduation-cap"></i> Learning Rewards</h4>
                    <div className="reward-items">
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-graduation-cap"></i></div>
                        <div className="reward-content">
                          <h5>Premium Course Unlock</h5>
                          <p>Access our most advanced courses that usually require payment</p>
                          <div className="reward-cost">5,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 5000}>
                          {stats.points >= 5000 ? 'Unlock Now' : `${5000 - stats.points} more needed`}
                        </button>
                      </div>
                      
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-certificate"></i></div>
                        <div className="reward-content">
                          <h5>Official Certificate</h5>
                          <p>Get a beautiful certificate to showcase your achievement</p>
                          <div className="reward-cost">1,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 1000}>
                          {stats.points >= 1000 ? 'Get Certificate' : `${1000 - stats.points} more needed`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Study Tools */}
                  <div className="reward-category">
                    <h4><i className="fas fa-tools"></i> Study Tools</h4>
                    <div className="reward-items">
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-book-open"></i></div>
                        <div className="reward-content">
                          <h5>Exclusive Study Guides</h5>
                          <p>Get access to our premium study materials and cheat sheets</p>
                          <div className="reward-cost">2,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 2000}>
                          {stats.points >= 2000 ? 'Access Now' : `${2000 - stats.points} more needed`}
                        </button>
                      </div>
                      
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-headphones"></i></div>
                        <div className="reward-content">
                          <h5>Offline Learning</h5>
                          <p>Download courses to learn anywhere, even without internet</p>
                          <div className="reward-cost">1,500 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 1500}>
                          {stats.points >= 1500 ? 'Download Now' : `${1500 - stats.points} more needed`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Personal Support */}
                  <div className="reward-category">
                    <h4><i className="fas fa-users"></i> Personal Support</h4>
                    <div className="reward-items">
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                        <div className="reward-content">
                          <h5>Personal Mentor Session</h5>
                          <p>Get 30 minutes of 1-on-1 guidance from our expert instructors</p>
                          <div className="reward-cost">8,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 8000}>
                          {stats.points >= 8000 ? 'Book Session' : `${8000 - stats.points} more needed`}
                        </button>
                      </div>
                      
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-bolt"></i></div>
                        <div className="reward-content">
                          <h5>Fast-Track Support</h5>
                          <p>Skip the queue and get help within 2 hours instead of 24</p>
                          <div className="reward-cost">3,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 3000}>
                          {stats.points >= 3000 ? 'Activate Now' : `${3000 - stats.points} more needed`}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Special Treats */}
                  <div className="reward-category">
                    <h4><i className="fas fa-star"></i> Special Treats</h4>
                    <div className="reward-items">
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-gift"></i></div>
                        <div className="reward-content">
                          <h5>JHub Swag Pack</h5>
                          <p>Get a cool t-shirt, mug, and stickers delivered to your door</p>
                          <div className="reward-cost">10,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 10000}>
                          {stats.points >= 10000 ? 'Order Swag' : `${10000 - stats.points} more needed`}
                        </button>
                      </div>
                      
                      <div className="reward-item">
                        <div className="reward-icon"><i className="fas fa-calendar-alt"></i></div>
                        <div className="reward-content">
                          <h5>VIP Learning Events</h5>
                          <p>Join exclusive live sessions with industry experts</p>
                          <div className="reward-cost">7,000 points</div>
                        </div>
                        <button className="btn-redeem" disabled={stats.points < 7000}>
                          {stats.points >= 7000 ? 'Join Events' : `${7000 - stats.points} more needed`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Keep Earning */}
                <div className="earn-points-section">
                  <h4><i className="fas fa-rocket"></i> Keep the Momentum Going!</h4>
                  <p style={{color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem'}}>
                    Here are all the ways you can keep earning points and unlocking amazing rewards:
                  </p>
                  <div className="earn-points-grid">
                    <div className="earn-point-item">
                      <div className="earn-icon"><i className="fas fa-book"></i></div>
                      <div className="earn-content">
                        <h5>Finish Courses</h5>
                        <p>Complete any course to earn 100 points</p>
                      </div>
                    </div>
                    <div className="earn-point-item">
                      <div className="earn-icon"><i className="fas fa-question-circle"></i></div>
                      <div className="earn-content">
                        <h5>Take Practice Quizzes</h5>
                        <p>Test your knowledge and earn 25 points each</p>
                      </div>
                    </div>
                    <div className="earn-point-item">
                      <div className="earn-icon"><i className="fas fa-users"></i></div>
                      <div className="earn-content">
                        <h5>Invite Friends</h5>
                        <p>Share the learning journey and get 100 points per friend</p>
                      </div>
                    </div>
                    <div className="earn-point-item">
                      <div className="earn-icon"><i className="fas fa-comments"></i></div>
                      <div className="earn-content">
                        <h5>Help Others</h5>
                        <p>Answer questions in our community for 50 points each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                        <i className="fas fa-tasks"></i>
                      </div>
                      <div className="metric-content">
                        <h5>Course Completion Rate</h5>
                          <span className="metric-value">
                            {stats.enrolledCourses > 0 ? Math.round((stats.completedCourses / stats.enrolledCourses) * 100) : 0}%
                          </span>
                          <span className="metric-label">
                            {stats.completedCourses > 0 ? 
                              `${stats.completedCourses} of ${stats.enrolledCourses} courses completed` :
                              stats.enrolledCourses > 0 ? 
                                `Start completing your ${stats.enrolledCourses} enrolled course${stats.enrolledCourses > 1 ? 's' : ''}` :
                                'No courses enrolled yet'
                            }
                          </span>
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="metric-content">
                        <h5>Average Performance</h5>
                          <span className="metric-value">
                            {enrolledCourses.length > 0 ? 
                              Math.round(enrolledCourses.reduce((sum, course) => sum + getProgressPercentage(course), 0) / enrolledCourses.length) : 
                              0}%
                          </span>
                          <span className="metric-label">
                            {enrolledCourses.length > 0 ? 
                              'Overall course progress' :
                              'Complete courses to track progress'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Streak */}
                  <div className="analytics-section">
                    <h4>Learning Streak</h4>
                    <div className="streak-info">
                      <div className="streak-card">
                        <div className="streak-icon">🔥</div>
                        <div className="streak-content">
                          <h5>Current Streak</h5>
                          <span className="streak-number">{calculateLearningStreak()} days</span>
                          <span className="streak-label">{calculateLearningStreak() > 0 ? 'Keep up the great work!' : 'Start learning to build your streak!'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Points History */}
                  <div className="analytics-section">
                    <h4>Points History</h4>
                    <div className="points-chart">
                      <div className="points-summary">
                        <div className="points-total">
                          <span className="points-number">{stats.points}</span>
                          <span className="points-label">Total Points Earned</span>
                        </div>
                                                <div className="points-breakdown">
                          <div className="points-item">
                            <span className="points-source">Course Enrollments</span>
                            <span className="points-value">+{recentActivity.filter(activity => activity.category === 'Progress').reduce((total, activity) => total + (activity.points || 0), 0)}</span>
                          </div>
                          <div className="points-item">
                            <span className="points-source">Email Verification</span>
                            <span className="points-value">+{user?.emailVerified ? 25 : 0}</span>
                          </div>
                          <div className="points-item">
                            <span className="points-source">Profile Completion</span>
                            <span className="points-value">+{user?.profileComplete ? 25 : 0}</span>
                          </div>
                          <div className="points-item">
                            <span className="points-source">Referrals & Other</span>
                            <span className="points-value">+{recentActivity.filter(activity => activity.category !== 'Progress').reduce((total, activity) => total + (activity.points || 0), 0)}</span>
                          </div>
                          <div className="points-item" style={{borderTop: '1px solid #e5e7eb', fontWeight: '600'}}>
                            <span className="points-source">Total Earned</span>
                            <span className="points-value">{user?.points || 0}</span>
                          </div>
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
