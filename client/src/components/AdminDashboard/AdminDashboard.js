import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    revenue: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    level: 'beginner',
    category: '',
    thumbnail: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/v1/admin/users`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data);
      }

      // Fetch courses
      const coursesRes = await fetch(`${API_BASE_URL}/api/v1/admin/courses`, { headers });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.data);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseForm)
      });

      if (response.ok) {
        setCourseForm({
          title: '',
          description: '',
          price: '',
          duration: '',
          level: 'beginner',
          category: '',
          thumbnail: ''
        });
        fetchDashboardData(); // Refresh data
        alert('Course created successfully!');
      } else {
        throw new Error('Failed to create course');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
        alert('Course deleted successfully!');
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>JHUB Admin</h2>
        </div>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'courses' ? 'active' : ''}
            onClick={() => setActiveTab('courses')}
          >
            📚 Courses
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button 
            className={activeTab === 'create-course' ? 'active' : ''}
            onClick={() => setActiveTab('create-course')}
          >
            ➕ Add Course
          </button>
        </nav>
        <button className="admin-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-user-info">
            Welcome, Admin
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Courses</h3>
                  <p className="stat-number">{stats.totalCourses}</p>
                </div>
                <div className="stat-card">
                  <h3>Enrollments</h3>
                  <p className="stat-number">{stats.totalEnrollments}</p>
                </div>
                <div className="stat-card">
                  <h3>Revenue</h3>
                  <p className="stat-number">${stats.revenue}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="courses-tab">
              <h2>Manage Courses</h2>
              <div className="courses-grid">
                {courses.map(course => (
                  <div key={course._id} className="course-card">
                    <img src={course.thumbnail || '/api/placeholder/300/200'} alt={course.title} />
                    <div className="course-info">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="course-meta">
                        <span className="price">${course.price}</span>
                        <span className="level">{course.level}</span>
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteCourse(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <h2>User Management</h2>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'create-course' && (
            <div className="create-course-tab">
              <h2>Create New Course</h2>
              <form onSubmit={handleCreateCourse} className="course-form">
                <div className="form-group">
                  <label>Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (hours)</label>
                    <input
                      type="number"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="url"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
                  />
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;