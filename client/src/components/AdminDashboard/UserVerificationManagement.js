import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserVerificationManagement.css';

const UserVerificationManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    verificationStatus: 'approved',
    verificationNotes: ''
  });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/v1/admin/users/pending-verification', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending verifications');
      }

      const data = await response.json();
      setPendingUsers(data.data || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!selectedUser || !verificationData.verificationStatus) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No admin token found. Please log in again.');
        return;
      }
      
      console.log('Submitting verification for user:', selectedUser._id);
      console.log('Verification data:', verificationData);
      
      const response = await fetch(`/api/v1/admin/users/${selectedUser._id}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationData)
      });

      console.log('Verification submission response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Verification submission API error:', errorData);
        throw new Error(errorData.message || `Failed to verify user (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('Verification submission successful:', data);
      
      // Update the local state
      setPendingUsers(prev => prev.filter(user => user._id !== selectedUser._id));
      
      // Close modal and reset
      setVerificationModal(false);
      setSelectedUser(null);
      setVerificationData({ verificationStatus: 'approved', verificationNotes: '' });
      
      // Show success message
      alert(`User verification ${verificationData.verificationStatus} successfully!`);
      
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const openVerificationModal = (user) => {
    setSelectedUser(user);
    setVerificationModal(true);
    setVerificationData({ verificationStatus: 'approved', verificationNotes: '' });
  };

  const closeVerificationModal = () => {
    setVerificationModal(false);
    setSelectedUser(null);
    setVerificationData({ verificationStatus: 'approved', verificationNotes: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="verification-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading pending verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-user-check"></i>
            User Verification Management
          </h1>
          <p>Review and verify new user accounts</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="admin-btn secondary" 
            onClick={() => navigate('/admin/dashboard')}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{pendingUsers.length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="verification-content">
        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>All caught up!</h3>
            <p>No users are currently pending verification.</p>
          </div>
        ) : (
          <div className="users-grid">
            {pendingUsers.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <div className="user-status pending">
                    <i className="fas fa-clock"></i>
                    Pending
                  </div>
                </div>

                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">{formatDate(user.createdAt)}</span>
                  </div>
                  
                  {user.referredBy && (
                    <div className="detail-item">
                      <span className="detail-label">Referred by:</span>
                      <span className="detail-value">{user.referredBy.name}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="detail-label">Points:</span>
                    <span className="detail-value">{user.points || 0}</span>
                  </div>
                </div>

                <div className="user-actions">
                  <button 
                    className="btn-verify"
                    onClick={() => openVerificationModal(user)}
                  >
                    <i className="fas fa-user-check"></i>
                    Review & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {verificationModal && selectedUser && (
        <div className="modal-overlay" onClick={closeVerificationModal}>
          <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verify User Account</h2>
              <button className="modal-close" onClick={closeVerificationModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="user-summary">
                <div className="user-avatar large">
                  <i className="fas fa-user"></i>
                </div>
                <div className="user-details-summary">
                  <h3>{selectedUser.name || 'Unnamed User'}</h3>
                  <p>{selectedUser.email || 'No email'}</p>
                  <span className="user-role">{selectedUser.role || 'student'}</span>
                </div>
              </div>

              <div className="verification-form">
                <div className="form-group">
                  <label>Verification Decision</label>
                  <select
                    value={verificationData.verificationStatus}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      verificationStatus: e.target.value
                    }))}
                    className="form-control"
                  >
                    <option value="approved">Approve Account</option>
                    <option value="rejected">Reject Account</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Verification Notes (Optional)</label>
                  <textarea
                    value={verificationData.verificationNotes}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      verificationNotes: e.target.value
                    }))}
                    className="form-control"
                    placeholder="Add any notes about this verification decision..."
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={closeVerificationModal}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className={`btn-primary ${verificationData.verificationStatus === 'rejected' ? 'danger' : ''}`}
                onClick={handleVerification}
                disabled={processing}
              >
                {processing ? (
                  <span>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </span>
                ) : (
                  <span>
                    <i className="fas fa-check"></i>
                    {verificationData.verificationStatus === 'approved' ? 'Approve User' : 'Reject User'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerificationManagement;
