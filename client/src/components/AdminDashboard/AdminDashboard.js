import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingCourses: 0,
    pendingVerifications: 0,
    totalWaitlists: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchDashboardData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found');
        navigate('/admin/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/v1/admin/stats', { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else if (statsResponse.status === 401) {
        console.error('Unauthorized access to admin stats');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/v1/admin/recent-activity', { headers });
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      } else if (activityResponse.status === 401) {
        console.error('Unauthorized access to recent activity');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      // Fetch pending verifications count
      try {
        const verificationsResponse = await fetch('/api/v1/admin/users/pending-verification', { headers });
        if (verificationsResponse.ok) {
          const verificationsData = await verificationsResponse.json();
          setStats(prev => ({
            ...prev,
            pendingVerifications: verificationsData.length || 0
          }));
        } else if (verificationsResponse.status === 401) {
          console.error('Unauthorized access to pending verifications');
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
      } catch (error) {
        console.log('Verifications endpoint not available yet');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <h1>🔐 Admin Dashboard</h1>
          <p>Welcome back, Administrator! Here's your platform overview.</p>
        </div>
        <div className="admin-dashboard-actions">
          <button className="admin-btn secondary" onClick={handleManualRefresh}>
            🔄 Refresh
          </button>
          <button className="admin-btn danger" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          👥 Users
        </button>
        <button 
          className={`admin-tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('courses')}
        >
          📚 Courses
        </button>
        <button 
          className={`admin-tab ${activeTab === 'interests' ? 'active' : ''}`}
          onClick={() => handleTabChange('interests')}
        >
          📝 Interests
        </button>
        <button 
          className={`admin-tab ${activeTab === 'waitlists' ? 'active' : ''}`}
          onClick={() => handleTabChange('waitlists')}
        >
          📋 Waitlists
        </button>
        <button 
          className={`admin-tab ${activeTab === 'verifications' ? 'active' : ''}`}
          onClick={() => handleTabChange('verifications')}
        >
          ✅ Verifications
          {stats.pendingVerifications > 0 && (
            <span className="notification-badge">{stats.pendingVerifications}</span>
          )}
        </button>
        <button 
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        {activeTab === 'overview' && (
          <>
            <div className="admin-dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
                  <span className="stat-change">Live data</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <h3>Total Courses</h3>
                  <p className="stat-number">{stats.totalCourses.toLocaleString()}</p>
                  <span className="stat-change">Live data</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>Enrollments</h3>
                  <p className="stat-number">{stats.totalEnrollments.toLocaleString()}</p>
                  <span className="stat-change">Live data</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Revenue</h3>
                  <p className="stat-number">₦{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                  <span className="stat-change">Live data</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Pending Verifications</h3>
                  <p className="stat-number">{stats.pendingVerifications.toLocaleString()}</p>
                  <span className="stat-change">Requires attention</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>Active Waitlists</h3>
                  <p className="stat-number">{stats.totalWaitlists.toLocaleString()}</p>
                  <span className="stat-change">Live data</span>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-charts">
              <div className="chart-container">
                <h3>📈 User Growth & Course Creation</h3>
                <div className="chart-placeholder">
                  <p>Chart data will appear here when available</p>
                  <small>Real-time analytics coming soon</small>
                </div>
              </div>

              <div className="chart-container">
                <h3>📊 User Distribution by Role</h3>
                <div className="chart-placeholder">
                  <p>Chart data will appear here when available</p>
                  <small>Real-time analytics coming soon</small>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-recent">
              <div className="recent-activity">
                <h3>🕒 Recent Activity</h3>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">{activity.icon}</div>
                        <div className="activity-content">
                          <p className="activity-text">{activity.text}</p>
                          <span className="activity-time">{activity.time}</span>
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
                  {stats.pendingVerifications > 0 && (
                    <button className="admin-btn warning" onClick={() => navigate('/admin/user-verifications')}>
                      ⚠️ Review Verifications ({stats.pendingVerifications})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="tab-section">
            <h2>👥 User Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/users')}>
                Manage Users
              </button>
              <button className="admin-btn primary" onClick={() => navigate('/admin/users/new')}>
                Add New User
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/user-verifications')}>
                User Verifications
              </button>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="tab-section">
            <h2>📚 Course Management</h2>
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
        )}

        {activeTab === 'interests' && (
          <div className="tab-section">
            <h2>📝 Course Interest Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/course-interests')}>
                View Course Interests
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/waitlists')}>
                Manage Waitlists
              </button>
            </div>
          </div>
        )}

        {activeTab === 'waitlists' && (
          <div className="tab-section">
            <h2>📋 Waitlist Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/waitlists')}>
                Manage Waitlists
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/course-interests?status=pending')}>
                View Pending Interests
              </button>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="tab-section">
            <h2>✅ User Verification Management</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/user-verifications')}>
                Review Pending Verifications
              </button>
              <button className="admin-btn secondary" onClick={() => navigate('/admin/users?filter=verification')}>
                View All Users
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-section">
            <h2>📈 Analytics</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/analytics')}>
                View Detailed Analytics
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-section">
            <h2>⚙️ Platform Settings</h2>
            <div className="tab-actions">
              <button className="admin-btn primary" onClick={() => navigate('/admin/settings')}>
                Configure Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
