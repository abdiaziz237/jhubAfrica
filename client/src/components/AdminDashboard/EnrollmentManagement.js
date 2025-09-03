import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import config from '../../config';

const EnrollmentManagement = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchEnrollments();
    fetchAnalytics();
  }, [filter, currentPage, searchTerm]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        filter,
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${config.API_BASE_URL}/v1/admin/enrollments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEnrollments(data.data || []);
          setPagination(data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10
          });
        } else {
          setError(data.message || 'Failed to fetch enrollments');
        }
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/v1/admin/enrollments/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data || null);
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment analytics:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', text: 'Active' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' },
      pending: { class: 'status-pending', text: 'Pending' }
    };
    
    const config = statusConfig[status] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getProgressBar = (progress) => {
    return (
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
        <span className="progress-text">{progress}%</span>
      </div>
    );
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="enrollment-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading enrollments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-management">
      <div className="tab-header">
        <h2>Enrollment Management</h2>
        <div className="tab-actions">
          <button className="admin-btn secondary" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="analytics-overview">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Total Enrollments</h4>
              <span className="analytics-number">{analytics?.overview?.totalEnrollments || 0}</span>
            </div>
            <div className="analytics-card">
              <h4>Active Enrollments</h4>
              <span className="analytics-number">{analytics?.overview?.activeEnrollments || 0}</span>
            </div>
            <div className="analytics-card">
              <h4>Completed</h4>
              <span className="analytics-number">{analytics?.overview?.completedEnrollments || 0}</span>
            </div>
            <div className="analytics-card">
              <h4>Completion Rate</h4>
              <span className="analytics-number">{analytics?.overview?.completionRate || 0}%</span>
            </div>
            <div className="analytics-card">
              <h4>Recent (30 days)</h4>
              <span className="analytics-number">{analytics?.overview?.recentEnrollments || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by student name, email, or course..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => handleFilterChange('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterChange('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="enrollments-table-container">
        {enrollments.length > 0 ? (
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Enrollment Date</th>
                <th>Last Accessed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td>
                    <div className="student-info">
                      <div className="student-name">{enrollment.student.name}</div>
                      <div className="student-email">{enrollment.student.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="course-info">
                      <div className="course-title">{enrollment.course.title}</div>
                      <div className="course-category">{enrollment.course.category}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(enrollment.status)}</td>
                  <td>{getProgressBar(enrollment.progress)}</td>
                  <td>{formatDate(enrollment.enrollmentDate)}</td>
                  <td>{formatDate(enrollment.lastAccessed)}</td>
                  <td>
                    <div className="enrollment-actions">
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/admin/users/${enrollment.student._id}`)}
                        title="View Student"
                      >
                        <i className="fas fa-user"></i>
                      </button>
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/admin/courses/${enrollment.course._id}`)}
                        title="View Course"
                      >
                        <i className="fas fa-book"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <i className="fas fa-graduation-cap"></i>
            <h3>No Enrollments Found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'No enrollments match your current filters.' 
                : 'No enrollments have been created yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
            <span className="pagination-total">({pagination?.totalItems || 0} total)</span>
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === (pagination?.totalPages || 1)}
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Top Courses Section */}
      {analytics && analytics.topCourses && analytics.topCourses.length > 0 && (
        <div className="top-courses-section">
          <h3>Top Courses by Enrollment</h3>
          <div className="top-courses-list">
            {analytics?.topCourses?.slice(0, 5).map((course, index) => (
              <div key={course.courseId} className="top-course-item">
                <div className="course-rank">#{index + 1}</div>
                <div className="course-details">
                  <div className="course-title">{course.courseTitle}</div>
                  <div className="enrollment-count">{course.enrollmentCount} enrollments</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
