import React, { useState, useEffect } from 'react';
import config from '../../config';
import './VerificationStatus.css';

const VerificationStatus = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      setVerificationStatus(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'approved':
        return 'fas fa-check-circle';
      case 'rejected':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'unknown';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your account is currently under review by our administrators. This process typically takes 24-48 hours.';
      case 'approved':
        return 'Congratulations! Your account has been verified and approved. You now have full access to all features.';
      case 'rejected':
        return 'Your account verification was not approved. Please contact support for more information.';
      default:
        return 'Unable to determine your verification status.';
    }
  };

  const getNextSteps = (status) => {
    switch (status) {
      case 'pending':
        return [
          'Wait for administrator review (24-48 hours)',
          'Ensure your profile information is complete',
          'Check your email for any verification requests'
        ];
      case 'approved':
        return [
          'Access your dashboard',
          'Browse available courses',
          'Start your learning journey'
        ];
      case 'rejected':
        return [
          'Contact support for clarification',
          'Review and update your profile information',
          'Resubmit for verification if applicable'
        ];
      default:
        return ['Contact support for assistance'];
    }
  };

  if (loading) {
    return (
      <div className="verification-status-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Checking your verification status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-status-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={checkVerificationStatus} className="btn-retry">
            <i className="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!verificationStatus) {
    return (
      <div className="verification-status-container">
        <div className="error-state">
          <i className="fas fa-user-slash"></i>
          <h3>No Account Found</h3>
          <p>Unable to retrieve your account information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-status-container">
      <div className="status-card">
        <div className="status-header">
          <div className={`status-icon ${getStatusColor(verificationStatus.verificationStatus)}`}>
            <i className={getStatusIcon(verificationStatus.verificationStatus)}></i>
          </div>
          <div className="status-info">
            <h1>Account Verification Status</h1>
            <p className="user-name">{verificationStatus.name}</p>
            <p className="user-email">{verificationStatus.email}</p>
          </div>
        </div>

        <div className="status-content">
          <div className={`status-badge ${getStatusColor(verificationStatus.verificationStatus)}`}>
            <i className={getStatusIcon(verificationStatus.verificationStatus)}></i>
            <span>
              {verificationStatus.verificationStatus === 'pending' && 'Pending Review'}
              {verificationStatus.verificationStatus === 'approved' && 'Approved'}
              {verificationStatus.verificationStatus === 'rejected' && 'Rejected'}
            </span>
          </div>

          <div className="status-message">
            <p>{getStatusMessage(verificationStatus.verificationStatus)}</p>
          </div>

          {verificationStatus.verificationNotes && (
            <div className="verification-notes">
              <h3>Administrator Notes</h3>
              <p>{verificationStatus.verificationNotes}</p>
            </div>
          )}

          <div className="next-steps">
            <h3>Next Steps</h3>
            <ul>
              {getNextSteps(verificationStatus.verificationStatus).map((step, index) => (
                <li key={index}>
                  <i className="fas fa-arrow-right"></i>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {verificationStatus.verificationStatus === 'approved' && (
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/dashboard'}
              >
                <i className="fas fa-tachometer-alt"></i>
                Go to Dashboard
              </button>
            </div>
          )}

          {verificationStatus.verificationStatus === 'rejected' && (
            <div className="action-buttons">
              <button className="btn-secondary">
                <i className="fas fa-headset"></i>
                Contact Support
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
