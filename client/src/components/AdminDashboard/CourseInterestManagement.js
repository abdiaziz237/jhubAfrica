import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Professional styling for course interest management
const customStyles = `
  .course-interest-management {
    padding: 20px;
    background: #f8fafc;
    min-height: 100vh;
  }

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  .page-header h1 {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    font-weight: 700;
  }

  .page-header p {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    text-align: center;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }

  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
    display: block;
  }

  .stat-content h3 {
    margin: 0 0 10px 0;
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .filters-section {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
  }

  .filters-section h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .filter-row {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-group label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-group select {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    color: #374151;
    min-width: 200px;
    transition: all 0.2s ease;
  }

  .filter-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .interests-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .interest-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .interest-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  }

  .interest-header {
    background: #f8fafc;
    padding: 20px 25px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .interest-course h3 {
    margin: 0 0 8px 0;
    color: #1e293b;
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .course-category {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .interest-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .status-badge {
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .interest-content {
    padding: 25px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .info-section h4 {
    margin: 0 0 15px 0;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 8px;
  }

  .info-grid {
    display: grid;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .info-label {
    color: #64748b;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .info-value {
    color: #1e293b;
    font-weight: 600;
    font-size: 0.9rem;
    text-align: right;
    max-width: 200px;
    word-wrap: break-word;
  }

  .motivation-section {
    grid-column: 1 / -1;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #f1f5f9;
  }

  .motivation-section h4 {
    margin: 0 0 15px 0;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .motivation-text {
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    color: #475569;
    line-height: 1.6;
    font-size: 0.9rem;
    max-height: 120px;
    overflow-y: auto;
  }

  .interest-actions {
    background: #f8fafc;
    padding: 20px 25px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-btn.view {
    background: #3b82f6;
    color: white;
  }

  .action-btn.view:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .status-actions {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .status-select {
    padding: 10px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .status-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .no-data {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
  }

  .no-data p {
    font-size: 1.1rem;
    margin: 0;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 15px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px;
    border-bottom: 2px solid #f1f5f9;
  }

  .modal-header h2 {
    margin: 0;
    color: #1e293b;
    font-size: 1.5rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #64748b;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .modal-body {
    padding: 30px;
  }

  .detail-section {
    margin-bottom: 25px;
  }

  .detail-section h3 {
    color: #1e293b;
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 2px solid #f1f5f9;
  }

  .detail-section p {
    margin: 0 0 10px 0;
    color: #475569;
    line-height: 1.6;
  }

  .detail-section strong {
    color: #1e293b;
    font-weight: 600;
  }

  .status-select.large {
    width: 100%;
    padding: 12px 16px;
    font-size: 1rem;
  }

  .modal-footer {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    padding: 25px 30px;
    border-top: 2px solid #f1f5f9;
    background: #f8fafc;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .btn.secondary {
    background: #6b7280;
    color: white;
  }

  .btn.secondary:hover {
    background: #4b5563;
  }

  @media (max-width: 768px) {
    .interest-content {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .interest-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
    
    .interest-actions {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-group select {
      min-width: auto;
    }
  }
`;

const CourseInterestManagement = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    courseId: 'all'
  });
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
    contacted: 0
  });

  useEffect(() => {
    fetchCourseInterests();
    fetchCourses();
  }, [filters]);

  const fetchCourseInterests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.courseId !== 'all') queryParams.append('courseId', filters.courseId);

      const response = await fetch(`/api/v1/admin/course-interests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setInterests(data.data);
          calculateStats(data.data);
        } else {
          setInterests([]);
          calculateStats([]);
        }
      } else {
        console.error('Failed to fetch course interests');
        setInterests([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error fetching course interests:', error);
      setInterests([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCourses(data.data);
        } else {
          setCourses([]);
        }
      } else {
        console.error('Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const calculateStats = (interestsData) => {
    const stats = {
      total: interestsData.length,
      pending: interestsData.filter(interest => interest.status === 'pending').length,
      reviewed: interestsData.filter(interest => interest.status === 'reviewed').length,
      approved: interestsData.filter(interest => interest.status === 'approved').length,
      rejected: interestsData.filter(interest => interest.status === 'rejected').length,
      contacted: interestsData.filter(interest => interest.status === 'contacted').length
    };
    setStats(stats);
  };

  const handleStatusChange = async (interestId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/v1/admin/course-interests/${interestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setInterests(prevInterests => 
          prevInterests.map(interest => 
            interest._id === interestId 
              ? { ...interest, status: newStatus }
              : interest
          )
        );
        
        // Refresh stats
        fetchCourseInterests();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const openDetailsModal = (interest) => {
    setSelectedInterest(interest);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedInterest(null);
    setShowDetailsModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      reviewed: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444',
      contacted: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      reviewed: '👁️',
      approved: '✅',
      rejected: '❌',
      contacted: '📞'
    };
    return icons[status] || '❓';
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'No motivation provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const cleanMotivationText = (text) => {
    if (!text) return 'No motivation provided';
    
    // Remove error messages and placeholder text
    if (text.includes('Error submitting interest') || text.includes('AxiosError')) {
      return 'Motivation text not available';
    }
    
    // Remove excessive placeholder text
    if (text.length > 200 && text.includes('df bgbg gyyyy ghff hhtti')) {
      return 'Motivation text not available';
    }
    
    return text;
  };

  if (loading) {
    return (
      <div className="course-interest-management">
        <style>{customStyles}</style>
        <div className="page-header">
          <h1><i className="fas fa-clipboard-list"></i> Course Interest Management</h1>
          <p>Manage and review course interest submissions from potential students</p>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="loading-spinner"></div>
        <p>Loading course interests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-interest-management">
      <style>{customStyles}</style>
      
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-clipboard-list"></i> Course Interest Management</h1>
        <p>Manage and review course interest submissions from potential students</p>
        </div>
        <div className="header-actions">
          <button 
            className="admin-btn secondary" 
            onClick={() => window.location.href = '/admin/dashboard'}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="stat-content">
            <h3>Total Interests</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Pending Review</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-eye"></i>
          </div>
          <div className="stat-content">
            <h3>Reviewed</h3>
            <p className="stat-number">{stats.reviewed}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <p className="stat-number">{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-number">{stats.rejected}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="stat-content">
            <h3>Contacted</h3>
            <p className="stat-number">{stats.contacted}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filter Options</h3>
        <div className="filter-row">
        <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
          <select
              id="status-filter"
            value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="contacted">Contacted</option>
          </select>
        </div>
        <div className="filter-group">
            <label htmlFor="course-filter">Course</label>
          <select
              id="course-filter"
            value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          </div>
        </div>
      </div>

      {/* Interests List */}
      <div className="interests-list">
        {interests.length === 0 ? (
          <div className="no-data">
            <p>No course interests found matching your criteria</p>
                  </div>
        ) : (
          interests.map((interest) => (
            <div key={interest._id} className="interest-card">
              <div className="interest-header">
                <div className="interest-course">
                  <h3>{interest.courseId?.title || 'Course Title Not Available'}</h3>
                  <span className="course-category">{interest.courseId?.category || 'Category Not Available'}</span>
                  </div>
                <div className="interest-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(interest.status) }}
                  >
                    {getStatusIcon(interest.status)} {interest.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="interest-content">
                <div className="info-section">
                  <h4>Applicant Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{interest.fullName || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{interest.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{interest.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Education:</span>
                      <span className="info-value">{interest.education || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Experience:</span>
                      <span className="info-value">{interest.experience || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Course Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Preferred Start:</span>
                      <span className="info-value">{interest.preferredStartDate || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Submitted:</span>
                      <span className="info-value">{new Date(interest.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="motivation-section">
                  <h4>Motivation</h4>
                  <div className="motivation-text">
                    {cleanMotivationText(interest.motivation)}
                  </div>
                </div>
              </div>
              
              <div className="interest-actions">
                    <button
                  className="action-btn view"
                  onClick={() => openDetailsModal(interest)}
                >
                  👁️ View Details
                    </button>
                
                <div className="status-actions">
                  <select
                    value={interest.status}
                    onChange={(e) => handleStatusChange(interest._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="reviewed">👁️ Reviewed</option>
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="contacted">📞 Contacted</option>
                  </select>
                </div>
              </div>
                  </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInterest && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Interest Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="modal-body">
                <div className="detail-section">
                <h3>Course Information</h3>
                <p><strong>Title:</strong> {selectedInterest.courseId?.title || 'N/A'}</p>
                <p><strong>Category:</strong> {selectedInterest.courseId?.category || 'N/A'}</p>
                </div>
                
                <div className="detail-section">
                <h3>Applicant Information</h3>
                <p><strong>Full Name:</strong> {selectedInterest.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedInterest.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedInterest.phone || 'N/A'}</p>
                <p><strong>Education:</strong> {selectedInterest.education || 'N/A'}</p>
                <p><strong>Experience:</strong> {selectedInterest.experience || 'N/A'}</p>
                </div>
                
                <div className="detail-section">
                <h3>Motivation</h3>
                <p>{cleanMotivationText(selectedInterest.motivation)}</p>
                </div>
                
                <div className="detail-section">
                <h3>Timing</h3>
                <p><strong>Preferred Start Date:</strong> {selectedInterest.preferredStartDate || 'Not specified'}</p>
                <p><strong>Submission Date:</strong> {new Date(selectedInterest.createdAt).toLocaleDateString()}</p>
                </div>
                
                  <div className="detail-section">
                <h3>Status Management</h3>
                <select
                  value={selectedInterest.status}
                  onChange={(e) => handleStatusChange(selectedInterest._id, e.target.value)}
                  className="status-select large"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="reviewed">👁️ Reviewed</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                  <option value="contacted">📞 Contacted</option>
                </select>
                  </div>
              </div>
              
            <div className="modal-footer">
              <button className="btn secondary" onClick={closeDetailsModal}>
                Close
                  </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseInterestManagement;
