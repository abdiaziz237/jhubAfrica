import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import './AdminDashboard.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    courseStats: [],
    revenueData: [],
    userRoles: [],
    geographicData: [],
    realTimeStats: {},
    enrollmentTrends: [],
    coursePerformance: [],
    userEngagement: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No admin token found. Please log in again.');
        return;
      }
      
      console.log('Fetching analytics from:', `${config.API_BASE_URL}/v1/admin/dashboard/analytics?period=${selectedPeriod}`);
      
      // Fetch comprehensive analytics data - fix the endpoint URL to match server routes
      const response = await fetch(`${config.API_BASE_URL}/v1/admin/dashboard/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Analytics response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data received:', data);
        if (data.success && data.data) {
          setAnalytics(data.data);
        } else {
          // Set default empty data structure
          setAnalytics({
            userGrowth: [],
            courseStats: [],
            revenueData: [],
            userRoles: [],
            geographicData: [],
            realTimeStats: {}
          });
        }
      } else {
        // Handle API errors gracefully
        const errorData = await response.json();
        console.error('Analytics API error:', errorData);
        setError(errorData.message || `Failed to fetch analytics data (Status: ${response.status})`);
        setAnalytics({
          userGrowth: [],
          courseStats: [],
          revenueData: [],
          userRoles: [],
          geographicData: [],
          realTimeStats: {}
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(`Network error: ${error.message}`);
      setAnalytics({
        userGrowth: [],
        courseStats: [],
        revenueData: [],
        userRoles: [],
        geographicData: [],
        realTimeStats: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Safe getter functions with null checks
  const getTotalUsers = () => {
    try {
      if (analytics.userGrowth && Array.isArray(analytics.userGrowth) && analytics.userGrowth.length > 0) {
        const latest = analytics.userGrowth[analytics.userGrowth.length - 1];
        return latest?.users || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting total users:', error);
      return 0;
    }
  };

  const getTotalRevenue = () => {
    try {
      if (analytics.revenueData && Array.isArray(analytics.revenueData)) {
        return analytics.revenueData.reduce((sum, item) => sum + (item?.revenue || item?.estimatedRevenue || 0), 0);
      }
      return 0;
    } catch (error) {
      console.error('Error getting total revenue:', error);
      return 0;
    }
  };

  const getTotalCourses = () => {
    try {
      if (analytics.courseStats && Array.isArray(analytics.courseStats)) {
        return analytics.courseStats.reduce((sum, item) => sum + (item?.enrollments || 0), 0);
      }
      return 0;
    } catch (error) {
      console.error('Error getting total courses:', error);
      return 0;
    }
  };

  const getActiveUsers = () => {
    try {
      if (analytics.realTimeStats && typeof analytics.realTimeStats === 'object') {
        return analytics.realTimeStats.activeUsers || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  // Analytics action functions
  const exportAnalyticsData = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateInsights = () => {
    // This would typically call an API to generate AI-powered insights
    alert('Insights generation feature coming soon! This will provide AI-powered recommendations based on your data.');
  };

  const setAlerts = () => {
    // This would typically open a modal to configure alerts
    alert('Alert configuration feature coming soon! Set up automated notifications for important metrics.');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="admin-header">
        <h1><i className="fas fa-chart-bar"></i> Analytics Dashboard</h1>
        <div className="admin-actions">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button 
            className="admin-btn secondary" 
            onClick={handleRefresh}
          >
                         <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button 
            className="admin-btn secondary" 
            onClick={() => navigate('/admin/dashboard')}
          >
                         <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Key Metrics Overview */}
      <div className="analytics-overview">
        <div className="metric-card">
                     <div className="metric-icon">
             <i className="fas fa-users"></i>
           </div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <p className="metric-number">{getTotalUsers().toLocaleString()}</p>
            <span className="metric-label">Registered users</span>
          </div>
        </div>

        <div className="metric-card">
                     <div className="metric-icon">
             <i className="fas fa-book"></i>
           </div>
          <div className="metric-content">
            <h3>Total Courses</h3>
            <p className="metric-number">{getTotalCourses().toLocaleString()}</p>
            <span className="metric-label">Active courses</span>
          </div>
        </div>

        <div className="metric-card">
                     <div className="metric-icon">
             <i className="fas fa-money-bill-wave"></i>
           </div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-number">KES {getTotalRevenue().toLocaleString()}</p>
            <span className="metric-label">Platform revenue</span>
          </div>
        </div>

        <div className="metric-card">
                     <div className="metric-icon">
             <i className="fas fa-circle"></i>
           </div>
          <div className="metric-content">
            <h3>Active Users</h3>
            <p className="metric-number">{getActiveUsers().toLocaleString()}</p>
            <span className="metric-label">Currently online</span>
          </div>
        </div>
      </div>

      {/* Charts and Data Visualization */}
      <div className="analytics-charts">
        <div className="chart-section">
                     <h3><i className="fas fa-chart-line"></i> User Growth Trends</h3>
          <div className="chart-container">
            {analytics.userGrowth && Array.isArray(analytics.userGrowth) && analytics.userGrowth.length > 0 ? (
              <div className="chart-data">
                <div className="growth-chart">
                  {analytics.userGrowth.map((data, index) => (
                    <div key={index} className="growth-bar">
                      <div className="bar-label">{data.period || data.month}</div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            height: `${Math.min((data.count / Math.max(...analytics.userGrowth.map(d => d.count))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="bar-value">{data.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>No user growth data available for the selected period</p>
                <small>Data will appear as users register</small>
              </div>
            )}
          </div>
        </div>

        <div className="chart-section">
                     <h3><i className="fas fa-chart-bar"></i> Course Performance</h3>
          <div className="chart-container">
            {analytics.courseStats && Array.isArray(analytics.courseStats) && analytics.courseStats.length > 0 ? (
              <div className="chart-data">
                <div className="performance-chart">
                  {analytics.courseStats.map((course, index) => (
                    <div key={index} className="performance-item">
                      <div className="course-name">{course._id || course.category}</div>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill" 
                          style={{ width: `${Math.min((course.count / Math.max(...analytics.courseStats.map(c => c.count))) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="performance-value">{course.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>No course performance data available</p>
                <small>Data will appear as courses are created and students enroll</small>
              </div>
            )}
          </div>
        </div>

        <div className="chart-section">
                     <h3><i className="fas fa-chart-pie"></i> Revenue Analytics</h3>
          <div className="chart-container">
            {analytics.revenueData && Array.isArray(analytics.revenueData) && analytics.revenueData.length > 0 ? (
              <div className="chart-data">
                <div className="revenue-chart">
                  {analytics.revenueData.map((item, index) => (
                    <div key={index} className="revenue-item">
                      <div className="revenue-period">{item.period || 'Total'}</div>
                      <div className="revenue-bar">
                        <div 
                          className="revenue-fill" 
                          style={{ 
                            width: `${Math.min(((item.revenue || item.estimatedRevenue || 0) / Math.max(...analytics.revenueData.map(r => r.revenue || r.estimatedRevenue || 0))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="revenue-value">KES {(item.revenue || item.estimatedRevenue || 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>No revenue data available</p>
                <small>Revenue will appear when courses are enrolled</small>
              </div>
            )}
          </div>
        </div>

        <div className="chart-section">
                     <h3><i className="fas fa-globe"></i> Geographic Distribution</h3>
          <div className="chart-container">
            {analytics.geographicData && Array.isArray(analytics.geographicData) && analytics.geographicData.length > 0 ? (
              <div className="chart-data">
                <p>Geographic data available</p>
                <small>Chart visualization coming soon</small>
              </div>
            ) : (
              <div className="chart-placeholder">
                <p>No geographic data available</p>
                <small>Data will appear as users from different locations register</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="real-time-stats">
                 <h3><i className="fas fa-clock"></i> Real-time Statistics</h3>
        <div className="stats-grid">
          {analytics.realTimeStats && typeof analytics.realTimeStats === 'object' && Object.keys(analytics.realTimeStats).length > 0 ? (
            Object.entries(analytics.realTimeStats).map(([key, value]) => (
              <div key={key} className="stat-item">
                <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
              </div>
            ))
          ) : (
            <div className="no-stats">
              <p>No real-time statistics available</p>
              <small>Real-time monitoring will be available soon</small>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Insights and Recommendations */}
      <div className="analytics-insights">
        <h3><i className="fas fa-lightbulb"></i> Key Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Growth Opportunities</h4>
              <p>
                {getTotalUsers() > 0 
                  ? `Your platform has ${getTotalUsers()} users. Focus on increasing engagement and course completion rates.`
                  : 'Start building your user base with targeted marketing campaigns.'
                }
              </p>
              <div className="insight-actions">
                <button className="insight-btn">View Growth Strategy</button>
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Course Strategy</h4>
              <p>
                {analytics.courseStats && analytics.courseStats.length > 0 
                  ? `You have ${analytics.courseStats.length} course categories. Consider adding more courses in popular categories.`
                  : 'Create your first course to start generating engagement and revenue.'
                }
              </p>
              <div className="insight-actions">
                <button className="insight-btn">Manage Courses</button>
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>Revenue Optimization</h4>
              <p>
                {getTotalRevenue() > 0 
                  ? `Current revenue: KES ${getTotalRevenue().toLocaleString()}. Focus on increasing user conversion and course pricing.`
                  : 'Implement monetization strategies to start generating revenue from your platform.'
                }
              </p>
              <div className="insight-actions">
                <button className="insight-btn">Revenue Settings</button>
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <div className="insight-content">
              <h4>User Engagement</h4>
              <p>
                {getActiveUsers() > 0 
                  ? `${getActiveUsers()} active users. Implement engagement strategies to increase retention.`
                  : 'Focus on user onboarding and engagement to build an active community.'
                }
              </p>
              <div className="insight-actions">
                <button className="insight-btn">Engagement Tools</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export and Actions */}
      <div className="analytics-actions">
                 <h3><i className="fas fa-download"></i> Data Export & Actions</h3>
        <div className="action-buttons">
          <button className="admin-btn secondary" onClick={() => exportAnalyticsData()}>
                         <i className="fas fa-file-export"></i> Export Analytics Report
          </button>
          <button className="admin-btn secondary" onClick={() => generateInsights()}>
                         <i className="fas fa-lightbulb"></i> Generate Insights
          </button>
          <button className="admin-btn secondary" onClick={() => setAlerts()}>
                         <i className="fas fa-bell"></i> Set Alerts
          </button>
        </div>
        <p className="feature-note">
          <small>Advanced analytics features are now available. Export data, generate insights, and set up automated alerts.</small>
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;


