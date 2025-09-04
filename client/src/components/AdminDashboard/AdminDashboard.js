import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import config from '../../config';
import EnrollmentManagement from './EnrollmentManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingCourses: 0,
    newUsersThisMonth: 0,
    courseCompletionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeRange, setTimeRange] = useState('30days');
  
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
        const token = localStorage.getItem('adminToken');
    if (!token) {
        navigate('/login');
        return;
    }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard statistics
      const statsRes = await axios.get(`${config.API_BASE_URL}/v1/admin/stats`, { headers });
      if (statsRes.data.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }

      // Fetch recent activity
      try {
        const activityRes = await axios.get(`${config.API_BASE_URL}/v1/admin/recent-activity`, { headers });
        if (activityRes.data.success && activityRes.data.data) {
          setRecentActivity(activityRes.data.data);
        }
      } catch (error) {
        console.log('No recent activity data available');
      }

      // Fetch user growth analytics
      try {
        const growthRes = await axios.get(`${config.API_BASE_URL}/v1/admin/dashboard/analytics/user-growth?period=${timeRange}`, { headers });
        if (growthRes.data.success && growthRes.data.data) {
          setUserGrowth(growthRes.data.data);
        }
      } catch (error) {
        console.log('No user growth data available');
      }

      // Fetch course performance analytics
      try {
        const performanceRes = await axios.get(`${config.API_BASE_URL}/v1/admin/dashboard/analytics/course-performance`, { headers });
        if (performanceRes.data.success && performanceRes.data.data) {
          setCoursePerformance(performanceRes.data.data);
        }
      } catch (error) {
        console.log('No course performance data available');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey, timeRange]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
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

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard-error">
        <div className="error-icon">⚠️</div>
        <h2>Dashboard Error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button className="admin-btn primary" onClick={refreshDashboard}>
          🔄 Try Again
        </button>
          <button className="admin-btn secondary" onClick={() => navigate('/admin/users')}>
            Manage Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Administrator. Here's your platform overview.</p>
        </div>
        <div className="admin-dashboard-actions">
          <div className="time-range-selector">
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="time-range-select"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          <button className="admin-btn secondary" onClick={refreshDashboard}>
            Refresh
          </button>
          <button className="admin-btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Users
        </button>
        <button 
          className={`admin-tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('courses')}
        >
          Courses
        </button>
        <button 
          className={`admin-tab ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => handleTabChange('enrollments')}
        >
          Enrollments
        </button>
        <button 
          className={`admin-tab ${activeTab === 'interests' ? 'active' : ''}`}
          onClick={() => handleTabChange('interests')}
        >
          Interests
        </button>
        <button 
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="admin-dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">Users</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
                  <span className="stat-change">
                    {stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth} this month` : 'Live data'}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Courses</div>
                <div className="stat-content">
                  <h3>Total Courses</h3>
                  <p className="stat-number">{stats.totalCourses.toLocaleString()}</p>
                  <span className="stat-change">
                    {stats.pendingCourses > 0 ? `${stats.pendingCourses} pending` : 'All courses active'}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Enrollments</div>
                <div className="stat-content">
                  <h3>Enrollments</h3>
                  <p className="stat-number">{stats.totalEnrollments.toLocaleString()}</p>
                  <span className="stat-change">
                    {stats.totalEnrollments > 0 
                      ? (stats.enrollmentStatus?.message || `${stats.courseCompletionRate}% completion rate`)
                      : 'No enrollments yet'
                    }
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Revenue</div>
                <div className="stat-content">
                  <h3>Revenue</h3>
                  <p className="stat-number">
                    {stats.totalRevenue > 0 ? `KES ${(stats.totalRevenue / 1000).toFixed(0)}K` : 'KES 0'}
                  </p>
                  <span className="stat-change">
                    {stats.totalRevenue > 0 ? 'Live data' : 'No revenue yet'}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Pending</div>
                <div className="stat-content">
                  <h3>Pending Courses</h3>
                  <p className="stat-number">{stats.pendingCourses.toLocaleString()}</p>
                  <span className="stat-change">
                    {stats.pendingCourses > 0 ? 'Requires attention' : 'All clear'}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">Active</div>
                <div className="stat-content">
                  <h3>Active Users</h3>
                  <p className="stat-number">{stats.activeUsers.toLocaleString()}</p>
                  <span className="stat-change">
                    {stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active` : 'No users yet'}
                  </span>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="admin-dashboard-charts">
              <div className="chart-container">
                <div className="chart-header">
                  <h3>User Growth Trend</h3>
                  <div className="chart-controls">
                    <span className="chart-period">{timeRange}</span>
                  </div>
                </div>
                <div className="chart-content">
                  {userGrowth.length > 0 ? (
                    <div className="growth-chart">
                      {userGrowth.map((data, index) => (
                        <div key={index} className="growth-bar">
                          <div className="bar-label">{data.period}</div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ height: `${(data.count / Math.max(...userGrowth.map(d => d.count))) * 100}%` }}
                            ></div>
                          </div>
                          <div className="bar-value">{data.count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                <div className="chart-placeholder">
                      <p>User growth data will appear here</p>
                      <small>Analytics data coming soon</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-header">
                  <h3>Course Performance</h3>
                </div>
                <div className="chart-content">
                  {coursePerformance.length > 0 ? (
                    <div className="performance-chart">
                      {coursePerformance.map((course, index) => (
                        <div key={index} className="performance-item">
                          <div className="course-name">{course.title}</div>
                          <div className="performance-bar">
                            <div 
                              className="performance-fill" 
                              style={{ width: `${course.enrollmentRate || 0}%` }}
                            ></div>
                          </div>
                          <div className="performance-value">{course.enrollmentRate || 0}%</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                <div className="chart-placeholder">
                      <p>Course performance data will appear here</p>
                      <small>Analytics data coming soon</small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="admin-dashboard-recent">
              <div className="recent-activity">
                <div className="activity-header">
                  <h3>Recent Activity</h3>
                  <button className="btn-refresh-small" onClick={refreshDashboard}>
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon" style={{color: activity.color || '#666'}}>
                          <i className={activity.icon || 'fas fa-circle'}></i>
                        </div>
                        <div className="activity-content">
                          <p className="activity-text">{activity.description}</p>
                          <span className="activity-time">
                            {activity.formattedDate ? `${activity.formattedDate} at ${activity.formattedTime}` : 
                             formatTimeAgo(activity.timestamp || activity.time || activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activity">
                      <p>No recent activity</p>
                      <small>Activity tracking will be available soon</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="quick-actions">
                <h3>⚡ Quick Actions</h3>
                <div className="action-buttons">
                  <button className="admin-btn primary" onClick={() => navigate('/admin/users/new')}>
                    ➕ Add New User
                  </button>
                  <button className="admin-btn primary" onClick={() => navigate('/admin/courses/new')}>
                    ➕ Add New Course
                  </button>
                  <button className="admin-btn secondary" onClick={() => navigate('/admin/analytics')}>
                    📊 View Analytics
                  </button>
                  <button className="admin-btn secondary" onClick={() => navigate('/admin/settings')}>
                    ⚙️ Platform Settings
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="tab-section">
            <div className="tab-header">
              <h2>User Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/users')}>
                Manage Users
              </button>
              <button className="admin-btn primary" onClick={() => navigate('/admin/users/new')}>
                Add New User
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/users?filter=active')}>
                View Active Users
              </button>
              </div>
            </div>
            <div className="tab-content">
              <div className="user-stats-overview">
                <div className="stat-overview-card">
                  <h4>Total Users</h4>
                  <span className="stat-number">{stats.totalUsers}</span>
                </div>
                <div className="stat-overview-card">
                  <h4>Active Users</h4>
                  <span className="stat-number">{stats.activeUsers}</span>
                </div>
                <div className="stat-overview-card">
                  <h4>New This Month</h4>
                  <span className="stat-number">{stats.newUsersThisMonth}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="tab-section">
            <div className="tab-header">
              <h2>Course Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/courses')}>
                Manage Courses
              </button>
              <button className="admin-btn primary" onClick={() => navigate('/admin/courses/new')}>
                Add New Course
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/course-interests')}>
                Course Interests
              </button>
              </div>
            </div>
            <div className="tab-content">
              <div className="course-stats-overview">
                <div className="stat-overview-card">
                  <h4>Total Courses</h4>
                  <span className="stat-number">{stats.totalCourses}</span>
                </div>
                <div className="stat-overview-card">
                  <h4>Pending Approval</h4>
                  <span className="stat-number">{stats.pendingCourses}</span>
                </div>
                <div className="stat-overview-card">
                  <h4>Total Enrollments</h4>
                  <span className="stat-number">{stats.totalEnrollments}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <EnrollmentManagement />
        )}

        {activeTab === 'interests' && (
          <div className="tab-section">
            <div className="tab-header">
              <h2>Course Interest Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/course-interests')}>
                View Course Interests
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/waitlists')}>
                Manage Waitlists
              </button>
            </div>
          </div>
            <div className="tab-content">
              <p>Manage course interests and waitlist applications from potential students.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-section">
            <div className="tab-header">
              <h2>📈 Analytics Dashboard</h2>
            <div className="tab-actions">
                <select 
                  value={timeRange} 
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="time-range-select"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="12months">Last 12 Months</option>
                </select>
                <button className="admin-btn primary" onClick={refreshDashboard}>
                  🔄 Refresh Data
              </button>
              </div>
            </div>
            <div className="tab-content">
              {/* Key Metrics Overview */}
              <div className="analytics-metrics">
                <div className="metric-overview-card">
                  <div className="metric-header">
                    <h4>👥 User Analytics</h4>
                    <span className="metric-period">{timeRange}</span>
                  </div>
                  <div className="metric-stats">
                    <div className="metric-stat">
                      <span className="metric-label">Total Users</span>
                      <span className="metric-value">{stats.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Active Users</span>
                      <span className="metric-value">{stats.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">New This Period</span>
                      <span className="metric-value">{stats.newUsersThisMonth || 0}</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Growth Rate</span>
                      <span className="metric-value">
                        {stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : '0%'}
                      </span>
                    </div>
all                    <div className="metric-stat">
                      <span className="metric-label">Conversion Rate</span>
                      <span className="metric-value">
                        {stats.totalUsers > 0 ? `${Math.round((stats.totalEnrollments / stats.totalUsers) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-overview-card">
                  <div className="metric-header">
                    <h4>📚 Course Analytics</h4>
                    <span className="metric-period">{timeRange}</span>
                  </div>
                  <div className="metric-stats">
                    <div className="metric-stat">
                      <span className="metric-label">Total Courses</span>
                      <span className="metric-value">{stats.totalCourses.toLocaleString()}</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Pending Approval</span>
                      <span className="metric-value">{stats.pendingCourses.toLocaleString()}</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Total Enrollments</span>
                      <span className="metric-value">{stats.totalEnrollments.toLocaleString()}</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Completion Rate</span>
                      <span className="metric-value">
                        {stats.courseCompletionRate > 0 ? `${stats.courseCompletionRate}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-overview-card">
                  <div className="metric-header">
                    <h4>💰 Financial Analytics</h4>
                    <span className="metric-period">{timeRange}</span>
                  </div>
                  <div className="metric-stats">
                    <div className="metric-stat">
                      <span className="metric-label">Total Revenue</span>
                      <span className="metric-value">KES {(stats.totalRevenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Avg. Revenue/User</span>
                      <span className="metric-value">
                        {stats.totalUsers > 0 ? `KES ${Math.round(stats.totalRevenue / stats.totalUsers)}` : 'KES 0'}
                      </span>
                    </div>
                    <div className="metric-stat">
                      <span className="metric-label">Revenue Growth</span>
                      <span className="metric-value">
                        {stats.totalRevenue > 0 ? 'Positive' : 'No data'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Charts */}
              <div className="analytics-charts">
                <div className="chart-container">
                  <div className="chart-header">
                    <h3>📈 User Growth Trend</h3>
                    <div className="chart-controls">
                      <span className="chart-period">{timeRange}</span>
                    </div>
                  </div>
                  <div className="chart-content">
                    {userGrowth.length > 0 ? (
                      <div className="growth-chart">
                        {userGrowth.map((data, index) => (
                          <div key={index} className="growth-bar">
                            <div className="bar-label">{data.period}</div>
                            <div className="bar-container">
                              <div 
                                className="bar-fill" 
                                style={{ height: `${(data.count / Math.max(...userGrowth.map(d => d.count))) * 100}%` }}
                              ></div>
                            </div>
                            <div className="bar-value">{data.count}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="chart-placeholder">
                        <p>User growth data will appear here</p>
                        <small>Analytics data coming soon</small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-header">
                    <h3>📊 Course Performance</h3>
                  </div>
                  <div className="chart-content">
                    {coursePerformance.length > 0 ? (
                      <div className="performance-chart">
                        {coursePerformance.map((course, index) => (
                          <div key={index} className="performance-item">
                            <div className="course-name">{course.title}</div>
                            <div className="performance-bar">
                              <div 
                                className="performance-fill" 
                                style={{ width: `${course.enrollmentRate || 0}%` }}
                              ></div>
                            </div>
                            <div className="performance-value">{course.enrollmentRate || 0}%</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="chart-placeholder">
                        <p>Course performance data will appear here</p>
                        <small>Analytics data coming soon</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Insights & Recommendations */}
              <div className="analytics-insights">
                <h3>💡 Key Insights</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <h4>Growth Opportunities</h4>
                      <p>
                        {stats.totalUsers > 0 
                          ? `Your platform has ${stats.totalUsers} users. Focus on increasing engagement and course completion rates.`
                          : 'Start building your user base with targeted marketing campaigns.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-icon">🎯</div>
                    <div className="insight-content">
                      <h4>Course Strategy</h4>
                      <p>
                        {stats.pendingCourses > 0 
                          ? `You have ${stats.pendingCourses} courses pending approval. Review and approve quality courses quickly.`
                          : 'All courses are active. Consider adding new courses to increase enrollment opportunities.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-icon">💰</div>
                    <div className="insight-content">
                      <h4>Revenue Optimization</h4>
                      <p>
                        {stats.totalRevenue > 0 
                          ? `Current revenue: KES ${(stats.totalRevenue / 1000).toFixed(0)}K. Focus on increasing user conversion and course pricing.`
                          : 'Implement monetization strategies to start generating revenue from your platform.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-section">
            <div className="tab-header">
              <h2>Platform Settings</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/settings')}>
                Configure Settings
              </button>
              </div>
            </div>
            <div className="tab-content">
              <p>Manage platform configuration, system preferences, and administrative settings.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;