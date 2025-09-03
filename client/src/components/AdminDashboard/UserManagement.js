import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css';
import config from '../../config';

const UserManagement = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    location: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if we're on an edit route
    if (userId && userId !== 'new') {
      fetchUserForEdit(userId);
    } else {
    fetchUsers();
    // Check if we're on the "new" route and show the form
    if (window.location.pathname.includes('/new')) {
      setShowAddForm(true);
    }
    }
  }, [userId]);

  const fetchUserForEdit = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.API_BASE_URL}/v1/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const user = data.data;
          setEditingUser(user);
          setFormData({
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            password: '',
            role: user.role || 'student',
            phone: user.phone || '',
            location: user.location || ''
          });
        }
      } else {
        setMessage('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.API_BASE_URL}/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setUsers(data.data);
        } else if (data.users && data.users.length > 0) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      } else {
        console.error('Failed to fetch users:', response.status);
        setUsers([]);
        setMessage('Failed to fetch users. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setMessage('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field-specific errors when user types
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!editingUser && !formData.password.trim()) errors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingUser 
        ? `/api/v1/admin/users/${editingUser._id}`
        : '/api/v1/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Prepare data for submission
      const submitData = { ...formData };
      if (editingUser && !submitData.password) {
        delete submitData.password; // Don't send password if not changing
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(editingUser ? 'User updated successfully!' : 'User created successfully!');
        
        // Reset form and refresh users
        resetForm();
        
        if (editingUser) {
          // If editing, redirect back to users list after a short delay
          setTimeout(() => {
            navigate('/admin/users');
          }, 1500);
        } else {
          // If creating, refresh users list
        await fetchUsers();
        }
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditUser = (user) => {
    // Navigate to edit page instead of showing form
    navigate(`/admin/users/${user._id}/edit`);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${config.API_BASE_URL}/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
        setMessage('User deleted successfully!');
        await fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      setMessage('Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'student',
      phone: '',
      location: ''
    });
    setEditingUser(null);
    setShowAddForm(false);
    setFormErrors({});
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // If we're on an edit route, show the edit form
  if (userId && userId !== 'new') {
    if (loading) {
      return (
        <div className="admin-user-management">
          <div className="admin-dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading user details...</p>
          </div>
        </div>
      );
    }

    if (!editingUser) {
      return (
        <div className="admin-user-management">
          <div className="admin-dashboard-error">
            <h2>User Not Found</h2>
            <p>Could not load user details.</p>
            <button className="admin-btn secondary" onClick={() => navigate('/admin/users')}>
              Back to Users
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-user-management">
        {/* Edit User Header */}
        <div className="user-management-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="admin-btn secondary"
              onClick={() => navigate('/admin/users')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              ← Back to Users
            </button>
            <div>
              <h1>Edit User</h1>
              <p>Update user information and settings.</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Edit User Form */}
        <div className="user-form-container">
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={formErrors.firstName ? 'error' : ''}
                  placeholder="Enter first name"
                />
                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={formErrors.lastName ? 'error' : ''}
                  placeholder="Enter last name"
                />
                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="admin-btn secondary" onClick={() => navigate('/admin/users')}>
                Cancel
              </button>
              <button type="submit" className="admin-btn primary" disabled={submitLoading}>
                {submitLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-user-management">
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      {/* Header */}
      <div className="user-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="admin-btn secondary" 
            onClick={() => navigate('/admin/dashboard')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1>User Management</h1>
            <p>Manage all users in the system. Add, edit, and remove users as needed.</p>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            className="filter-select"
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
          
          <select 
            className="filter-select"
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            className="admin-btn primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New User
          </button>
        </div>
      </div>

      {/* User Form - Only show for adding new users */}
      {showAddForm && !editingUser && (
        <div className="user-form-container">
          <div className="form-header">
            <h2>Add New User</h2>
            <button className="close-btn" onClick={resetForm}>×</button>
              </div>
            
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={formErrors.firstName ? 'error' : ''}
                  placeholder="Enter first name"
                />
                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={formErrors.lastName ? 'error' : ''}
                  placeholder="Enter last name"
                />
                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={formErrors.password ? 'error' : ''}
                  placeholder="Enter password"
                />
                {formErrors.password && <span className="error-message">{formErrors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              </div>

              <div className="form-group">
              <label htmlFor="location">Location</label>
                <input
                  type="text"
                id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                placeholder="Enter location"
                />
              </div>

              <div className="form-actions">
              <button type="button" className="admin-btn secondary" onClick={resetForm}>
                  Cancel
                </button>
              <button type="submit" className="admin-btn primary" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </form>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>{users.length === 0 ? 'No users have been added yet.' : 'No users match your current filters.'}</p>
        </div>
        ) : (
            <table className="users-table">
            <thead>
              <tr>
                  <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </td>
                    <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.location || '-'}</td>
                  <td>
                    <div className="user-actions">
                    <button 
                        className="btn-edit"
                        onClick={() => handleEditUser(user)}
                    >
                        Edit
                    </button>
                    <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;