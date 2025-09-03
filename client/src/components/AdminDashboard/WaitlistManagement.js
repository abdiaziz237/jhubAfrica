import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Professional styling for waitlist management
const customStyles = `
  .waitlist-management {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .course-selection {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .filter-group label {
    font-weight: 600;
    color: #374151;
    font-size: 1rem;
  }

  .filter-group select {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    color: #374151;
    min-width: 300px;
    transition: all 0.2s ease;
  }

  .filter-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .course-overview {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
  }

  .overview-card h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  .stat-label {
    color: #64748b;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .stat-value {
    color: #1e293b;
    font-weight: 600;
    font-size: 1rem;
  }

  .status-badge {
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .waitlist-stats {
    margin-bottom: 30px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
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
    color: #1e293b;
    font-size: 2rem;
    font-weight: 700;
  }

  .stat-content p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cohort-actions {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    margin-bottom: 30px;
    border: 1px solid #e2e8f0;
  }

  .cohort-actions h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .action-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .btn-success, .btn-warning, .btn-info, .btn-secondary {
    padding: 12px 24px;
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

  .btn-success {
    background: #10b981;
    color: white;
  }

  .btn-warning {
    background: #f59e0b;
    color: white;
  }

  .btn-info {
    background: #3b82f6;
    color: white;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-success:hover, .btn-warning:hover, .btn-info:hover, .btn-secondary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .waitlist-table-container {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
  }

  .waitlist-table-container h3 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .waitlist-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  .waitlist-table th {
    background: #f1f5f9;
    padding: 18px 15px;
    text-align: left;
    font-weight: 600;
    color: #475569;
    border-bottom: 2px solid #e2e8f0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .waitlist-table td {
    padding: 20px 15px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }

  .waitlist-table tr:hover {
    background: #f8fafc;
  }

  .student-info strong {
    display: block;
    color: #1e293b;
    font-size: 1rem;
    margin-bottom: 5px;
  }

  .student-info small {
    color: #64748b;
    font-size: 0.9rem;
  }

  .no-waitlist {
    text-align: center;
    padding: 40px;
    color: #64748b;
  }

  .no-waitlist p {
    font-size: 1.1rem;
    margin: 0;
  }

  .no-course-selected {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-state {
    max-width: 400px;
    margin: 0 auto;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .empty-state h3 {
    margin: 0 0 15px 0;
    color: #1e293b;
    font-size: 1.5rem;
  }

  .empty-state p {
    color: #64748b;
    line-height: 1.6;
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
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px;
    border-bottom: 2px solid #f1f5f9;
  }

  .modal-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.3rem;
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

  .modal-body p {
    margin: 0 0 15px 0;
    color: #475569;
    line-height: 1.6;
  }

  .modal-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 25px;
  }

  .admin-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .admin-loading p {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
  }

  .waitlist-filters {
    background: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
  }

  .filter-row {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .filter-item label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-item select, .filter-item input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
    color: #374151;
  }

  .export-actions {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }

  .export-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-btn:hover {
    background: #f1f5f9;
    border-color: #9ca3af;
  }

  @media (max-width: 768px) {
    .overview-stats {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .export-actions {
      margin-left: 0;
      margin-top: 15px;
    }
  }
`;

const WaitlistManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [waitlistData, setWaitlistData] = useState({
    course: null,
    waitlist: [],
    stats: {
      total: 0,
      waiting: 0,
      notified: 0,
      enrolled: 0,
      cancelled: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [cohortAction, setCohortAction] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
    sortBy: 'joinDate',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.courses && data.courses.length > 0) {
          setCourses(data.courses);
          // Set first course as default if available
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0]);
            fetchWaitlistData(data.courses[0]._id);
          }
        } else {
          setCourses([]);
          setSelectedCourse(null);
        }
      } else {
        setCourses([]);
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setSelectedCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlistData = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/v1/admin/courses/${courseId}/waitlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setWaitlistData(data.data);
        } else {
          setWaitlistData({
            course: null,
            waitlist: [],
            stats: { total: 0, waiting: 0, notified: 0, enrolled: 0, cancelled: 0 }
          });
        }
      } else {
        setWaitlistData({
          course: null,
          waitlist: [],
          stats: { total: 0, waiting: 0, notified: 0, enrolled: 0, cancelled: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching waitlist data:', error);
      setWaitlistData({
        course: null,
        waitlist: [],
        stats: { total: 0, waiting: 0, notified: 0, enrolled: 0, cancelled: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    if (courseId === 'all') {
      setSelectedCourse(null);
      setWaitlistData({
        course: null,
        waitlist: [],
        stats: { total: 0, waiting: 0, notified: 0, enrolled: 0, cancelled: 0 }
      });
      return;
    }
    
    const course = courses.find(c => c._id === courseId);
    setSelectedCourse(course);
    
    if (course) {
      fetchWaitlistData(courseId);
    }
  };

  const handleCohortAction = async (action) => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('adminToken');
      let endpoint = '';
      
      switch (action) {
        case 'start':
          endpoint = `/api/v1/admin/courses/${selectedCourse._id}/start-cohort`;
          break;
        case 'complete':
          endpoint = `/api/v1/admin/courses/${selectedCourse._id}/complete-cohort`;
          break;
        case 'open':
          endpoint = `/api/v1/admin/courses/${selectedCourse._id}/open-cohort`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Cohort action completed successfully');
        // Refresh waitlist data
        fetchWaitlistData(selectedCourse._id);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to perform cohort action');
      }
    } catch (error) {
      console.error('Error performing cohort action:', error);
      alert('Failed to perform cohort action. Please try again.');
    }
  };

  const getCohortStatusColor = (status) => {
    const colors = {
      planning: '#95a5a6',
      recruiting: '#3498db',
      ready: '#f39c12',
      'in-progress': '#27ae60',
      completed: '#9b59b6'
    };
    return colors[status] || '#95a5a6';
  };

  const getCohortStatusText = (status) => {
    const texts = {
      planning: 'Planning Phase',
      recruiting: 'Recruiting Students',
      ready: 'Ready to Start',
      'in-progress': 'In Progress',
      completed: 'Completed'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportWaitlist = (format) => {
    if (!waitlistData.waitlist || waitlistData.waitlist.length === 0) {
      alert('No waitlist data to export');
      return;
    }

    if (format === 'csv') {
      const headers = ['Position', 'Name', 'Email', 'Join Date', 'Status', 'Notes'];
      const csvContent = [headers.join(',')];
      
      waitlistData.waitlist.forEach((entry, index) => {
        const row = [
          index + 1,
          entry.user?.name || 'Unknown',
          entry.user?.email || 'No email',
          formatDate(entry.joinDate),
          entry.status,
          entry.notes || ''
        ];
        csvContent.push(row.join(','));
      });

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCourse?.title || 'course'}-waitlist.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const filteredWaitlist = waitlistData.waitlist?.filter(entry => {
    const matchesStatus = filters.status === 'all' || entry.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
      entry.user?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      entry.user?.email?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }) || [];

  const sortedWaitlist = [...filteredWaitlist].sort((a, b) => {
    let aValue = a[filters.sortBy];
    let bValue = b[filters.sortBy];
    
    if (filters.sortBy === 'joinDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading && !waitlistData) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading waitlist data...</p>
      </div>
    );
  }

  return (
    <div className="waitlist-management">
      <style>{customStyles}</style>
      
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-clipboard-list"></i> Waitlist Management</h1>
          <p>Professional waitlist management and cohort formation system</p>
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

      {/* Course Selection */}
      <div className="course-selection">
        <div className="filter-group">
          <label htmlFor="courseSelect">Select Course:</label>
          <select
            id="courseSelect"
            value={selectedCourse?._id || 'all'}
            onChange={(e) => handleCourseSelect(e.target.value)}
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

      {selectedCourse && waitlistData && (
        <>
          {/* Course Overview */}
          <div className="course-overview">
            <div className="overview-card">
              <h3>{selectedCourse.title}</h3>
              <div className="overview-stats">
                <div className="stat-item">
                  <span className="stat-label">Cohort Status:</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getCohortStatusColor(selectedCourse.cohortStatus) }}
                  >
                    {getCohortStatusText(selectedCourse.cohortStatus)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Max Students:</span>
                  <span className="stat-value">{selectedCourse.maxStudents}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Ready Threshold:</span>
                  <span className="stat-value">{selectedCourse.cohortReadyThreshold}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cohort Start Date:</span>
                  <span className="stat-value">{formatDate(selectedCourse.cohortStartDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist Statistics */}
          <div className="waitlist-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{waitlistData.stats?.total || 0}</h3>
                  <p>Total Waitlist</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{waitlistData.stats?.waiting || 0}</h3>
                  <p>Waiting</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔔</div>
                <div className="stat-content">
                  <h3>{waitlistData.stats?.notified || 0}</h3>
                  <p>Notified</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{waitlistData.stats?.enrolled || 0}</h3>
                  <p>Enrolled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cohort Actions */}
          <div className="cohort-actions">
            <h3>Cohort Management</h3>
            <div className="action-buttons">
              {selectedCourse.cohortStatus === 'ready' && (
                <button
                  className="btn-success"
                  onClick={() => handleCohortAction('start')}
                >
                  🚀 Start Cohort
                </button>
              )}
              {selectedCourse.cohortStatus === 'in-progress' && (
                <button
                  className="btn-warning"
                  onClick={() => handleCohortAction('complete')}
                >
                  🎯 Complete Cohort
                </button>
              )}
              {selectedCourse.cohortStatus === 'completed' && (
                <button
                  className="btn-info"
                  onClick={() => handleCohortAction('open')}
                >
                  🔓 Open New Cohort
                </button>
              )}
              {selectedCourse.cohortStatus === 'planning' && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setCohortAction('recruiting');
                    setShowCohortModal(true);
                  }}
                >
                  📢 Start Recruiting
                </button>
              )}
            </div>
          </div>

          {/* Waitlist Filters and Export */}
          <div className="waitlist-filters">
            <div className="filter-row">
              <div className="filter-item">
                <label>Status Filter</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Statuses</option>
                  <option value="waiting">Waiting</option>
                  <option value="notified">Notified</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="filter-item">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                />
              </div>
              
              <div className="filter-item">
                <label>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="joinDate">Join Date</option>
                  <option value="user.name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
              
              <div className="filter-item">
                <label>Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              
              <div className="export-actions">
                <button 
                  className="export-btn"
                  onClick={() => exportWaitlist('csv')}
                  title="Export to CSV"
                >
                  📊 Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Waitlist Table */}
          <div className="waitlist-table-container">
            <h3>Waitlist Students ({sortedWaitlist.length})</h3>
            {sortedWaitlist.length > 0 ? (
              <table className="waitlist-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Student</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWaitlist.map((entry, index) => (
                    <tr key={entry._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="student-info">
                          <strong>{entry.user?.name || 'Unknown'}</strong>
                          <small>{entry.user?.email || 'No email'}</small>
                        </div>
                      </td>
                      <td>{formatDate(entry.joinDate)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: entry.status === 'waiting' ? '#f39c12' : 
                                         entry.status === 'notified' ? '#3498db' : 
                                         entry.status === 'enrolled' ? '#27ae60' : '#95a5a6'
                          }}
                        >
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </td>
                      <td>{entry.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-waitlist">
                <p>No students found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedCourse && (
        <div className="no-course-selected">
          <div className="empty-state">
                            <div className="empty-icon">
                  <i className="fas fa-book"></i>
                </div>
            <h3>Select a Course</h3>
            <p>Choose a course from the dropdown above to view its waitlist and manage cohorts.</p>
          </div>
        </div>
      )}

      {/* Cohort Settings Modal */}
      {showCohortModal && (
        <div className="modal-overlay" onClick={() => setShowCohortModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Cohort Settings</h3>
              <button className="close-btn" onClick={() => setShowCohortModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to change the cohort status to "Recruiting"?</p>
              <p>This will allow students to join the waitlist for this course.</p>
              
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCohortModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-success"
                  onClick={() => {
                    handleCohortAction('open');
                    setShowCohortModal(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistManagement;
