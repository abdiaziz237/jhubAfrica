import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Custom styles for better visual appearance
const customStyles = `
  .admin-course-management {
    padding: 20px;
    background: #f8fafc;
    min-height: 100vh;
  }

  .admin-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  .header-content h1 {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    font-weight: 700;
  }

  .header-content p {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
  }

  .admin-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
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

  .courses-table {
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    overflow: hidden;
  }

  .table-header {
    background: #f8fafc;
    padding: 20px 25px;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-header h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .enhanced-table {
    width: 100%;
    border-collapse: collapse;
  }

  .enhanced-table th {
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

  .enhanced-table td {
    padding: 20px 15px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }

  .enhanced-table tr:hover {
    background: #f8fafc;
  }

  .course-info {
    max-width: 300px;
  }

  .course-title strong {
    display: block;
    color: #1e293b;
    font-size: 1.1rem;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .course-title small {
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .course-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .meta-item {
    background: #f1f5f9;
    color: #475569;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .category-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-block;
  }

  .status-badge {
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-block;
    text-transform: capitalize;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .admin-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .admin-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .admin-btn.secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .admin-btn.danger {
    background: #ef4444;
    color: white;
  }

  .admin-btn.small {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .admin-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .admin-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .admin-form-overlay {
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

  .admin-form-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f1f5f9;
  }

  .form-header h2 {
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

  .form-group {
    margin-bottom: 20px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #374151;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: white;
  }

  .form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-input::placeholder {
    color: #9ca3af;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: 500;
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
  }

  .form-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #f1f5f9;
  }

  .error-message {
    background: #fef2f2;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #fecaca;
    margin-bottom: 20px;
    font-size: 0.9rem;
  }

  .no-data {
    text-align: center;
    padding: 40px;
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
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .modal-content.large {
    max-width: 1000px;
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

  .modal-body {
    padding: 30px;
  }

  .course-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
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

  .status-badge.inline {
    margin-left: 8px;
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .modal-footer {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    padding: 25px 30px;
    border-top: 2px solid #f1f5f9;
    background: #f8fafc;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .course-details-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    points: 0,
    price: 0,
    maxStudents: 50,
    status: 'active',
    waitlistEnabled: true,
    duration: '8-12 weeks',
    prerequisites: 'None'
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Digital Literacy & Office Productivity',
    'Business & Entrepreneurship',
    'Networking & IT Certifications',
    'Programming & App Development',
    'Data Science & Analytics',
    'Cybersecurity'
  ];

  const statuses = ['active', 'inactive', 'draft'];

  useEffect(() => {
    fetchCourses();
    if (window.location.pathname.includes('/new')) {
      setShowAddForm(true);
    }
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
        const coursesData = data.data || data.courses || [];
        setCourses(coursesData);
        calculateStats(coursesData);
      } else {
        console.error('Failed to fetch courses:', response.status);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (coursesData) => {
    const stats = {
      total: coursesData.length,
      active: coursesData.filter(c => c.status === 'active').length,
      inactive: coursesData.filter(c => c.status === 'inactive').length,
      draft: coursesData.filter(c => c.status === 'draft').length
    };
    setStats(stats);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormErrors({});

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      setFormErrors({ general: 'Please fill in all required fields' });
      setSubmitLoading(false);
      return;
    }

    if (formData.maxStudents < 1) {
      setFormErrors({ maxStudents: 'Max students must be at least 1' });
      setSubmitLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCourse 
        ? `/api/v1/admin/courses/${editingCourse._id}`
        : '/api/v1/admin/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
        setShowAddForm(false);
        setEditingCourse(null);
        resetForm();
        fetchCourses();
      } else {
        const errorData = await response.json();
        setFormErrors({ general: errorData.message || 'Failed to save course' });
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setFormErrors({ general: 'Network error. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      image: '',
      points: 0,
      price: 0,
      maxStudents: 50,
      status: 'active',
      waitlistEnabled: true,
      duration: '8-12 weeks',
      prerequisites: 'None'
    });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      image: course.image || '',
      points: course.points || 0,
      price: course.price || 0,
      maxStudents: course.maxStudents || 50,
      status: course.status || 'active',
      waitlistEnabled: course.waitlistEnabled !== undefined ? course.waitlistEnabled : true,
      duration: course.duration || '8-12 weeks',
      prerequisites: course.prerequisites || 'None'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/v1/admin/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          fetchCourses();
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const openDetailsModal = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedCourse(null);
    setShowDetailsModal(false);
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingCourse(null);
    resetForm();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      inactive: '#6b7280',
      draft: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="admin-course-management">
      <style>{customStyles}</style>
      
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
        <h1>📚 Course Management</h1>
          <p>Create, edit, and manage all courses</p>
        </div>
        <div className="admin-actions">
          <button 
            className="admin-btn primary" 
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add New Course
          </button>
          <button 
            className="admin-btn secondary" 
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Courses</h3>
            <p className="stat-number">{stats.active}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏸️</div>
          <div className="stat-content">
            <h3>Inactive Courses</h3>
            <p className="stat-number">{stats.inactive}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Draft Courses</h3>
            <p className="stat-number">{stats.draft}</p>
          </div>
        </div>
      </div>

      {/* Course Form Modal */}
      {showAddForm && (
        <div className="admin-form-overlay">
          <div className="admin-form-card">
            <div className="form-header">
            <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button className="close-btn" onClick={cancelEdit}>×</button>
            </div>
            
            {formErrors.general && (
              <div className="error-message">
                {formErrors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter course title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  rows="4"
                  placeholder="Enter detailed course description"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Points</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Price (₦)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>

                <div className="form-group">
                  <label>Max Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                  </select>
                </div>

                <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                    onChange={handleInputChange}
                    className="form-input"
                  placeholder="e.g., 8-12 weeks"
                />
                </div>

              <div className="form-group">
                <label>Prerequisites</label>
                <input
                  type="text"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Basic computer skills"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="waitlistEnabled"
                    checked={formData.waitlistEnabled}
                    onChange={handleInputChange}
                  />
                  Enable Waitlists
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="admin-btn primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Add Course')}
                </button>
                <button 
                  type="button" 
                  className="admin-btn secondary"
                  onClick={cancelEdit}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="courses-table">
        <div className="table-header">
        <h3>All Courses ({courses.length})</h3>
        </div>
        
        <div className="table-container">
          <table className="enhanced-table">
            <thead>
              <tr>
                <th>Course Details</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    <p>No courses found. Create your first course!</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                <tr key={course._id}>
                  <td>
                      <div className="course-info">
                    <div className="course-title">
                      <strong>{course.title}</strong>
                          <small>{course.description?.substring(0, 80)}...</small>
                        </div>
                        <div className="course-meta">
                          <span className="meta-item">📊 {course.points} pts</span>
                          <span className="meta-item">💰 ₦{course.price?.toLocaleString()}</span>
                          <span className="meta-item">⏱️ {course.duration}</span>
                        </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">
                      {course.category}
                    </span>
                  </td>
                  <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(course.status) }}
                      >
                      {course.status}
                    </span>
                  </td>
                  <td>
                      <div className="action-buttons">
                        <button 
                          className="admin-btn small secondary"
                          onClick={() => openDetailsModal(course)}
                          title="View Details"
                        >
                          👁️
                        </button>
                    <button 
                      className="admin-btn small secondary"
                      onClick={() => handleEdit(course)}
                          title="Edit Course"
                    >
                          ✏️
                    </button>
                    <button 
                      className="admin-btn small danger"
                      onClick={() => handleDelete(course._id)}
                          title="Delete Course"
                    >
                          🗑️
                    </button>
                      </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Course Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="course-details-grid">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <p><strong>Title:</strong> {selectedCourse.title}</p>
                  <p><strong>Category:</strong> {selectedCourse.category}</p>
                  <p><strong>Description:</strong> {selectedCourse.description}</p>
                  <p><strong>Points:</strong> {selectedCourse.points}</p>
                  <p><strong>Price:</strong> ₦{selectedCourse.price?.toLocaleString()}</p>
                  <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Status & Settings</h3>
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge inline"
                      style={{ backgroundColor: getStatusColor(selectedCourse.status) }}
                    >
                      {selectedCourse.status}
                    </span>
                  </p>
                  <p><strong>Max Students:</strong> {selectedCourse.maxStudents}</p>
                  <p><strong>Waitlist Enabled:</strong> {selectedCourse.waitlistEnabled ? 'Yes' : 'No'}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Additional Information</h3>
                  <p><strong>Prerequisites:</strong> {selectedCourse.prerequisites}</p>
                  <p><strong>Created:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(selectedCourse.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => handleEdit(selectedCourse)}>
                ✏️ Edit Course
              </button>
              <button className="admin-btn secondary" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
