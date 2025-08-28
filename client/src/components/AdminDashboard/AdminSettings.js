import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'JHUB Africa',
    contactEmail: 'admin@jhub.africa',
    maxStudentsPerCourse: 100,
    waitlistEnabled: true,
    emailNotifications: true,
    maintenanceMode: false,
    registrationEnabled: true,
    courseApprovalRequired: true,
    verificationRequired: true,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    sessionTimeout: 24,
    backupFrequency: 'daily',
    analyticsEnabled: true,
    debugMode: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          setOriginalSettings(data.settings);
        } else {
          // Use default settings if API doesn't return data
          console.log('Using default settings');
        }
      } else {
        console.log('Settings endpoint not available, using defaults');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Continue with default settings
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const handleArrayChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Settings updated successfully!');
        setMessageType('success');
        setOriginalSettings(settings);
        setHasChanges(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to update settings');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const handleTestEmail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: settings.contactEmail })
      });

      if (response.ok) {
        setMessage('Test email sent successfully!');
        setMessageType('success');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to send test email');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/system/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          maintenanceMode: !settings.maintenanceMode,
          message: settings.maintenanceMode ? 'System is now online' : 'System is under maintenance'
        })
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
        setMessage(`Maintenance mode ${!settings.maintenanceMode ? 'enabled' : 'disabled'} successfully!`);
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to toggle maintenance mode');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !hasChanges) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <h1>⚙️ Platform Settings</h1>
        <div className="admin-actions">
          <button 
            className="admin-btn secondary" 
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        {/* General Settings */}
        <div className="settings-section">
          <h3>🌐 General Settings</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="platformName">Platform Name</label>
              <input
                type="text"
                id="platformName"
                name="platformName"
                value={settings.platformName}
                onChange={handleInputChange}
                placeholder="Enter platform name"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <div className="input-with-button">
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleInputChange}
                  placeholder="admin@jhub.africa"
                />
                <button 
                  type="button" 
                  className="admin-btn small secondary"
                  onClick={handleTestEmail}
                  disabled={loading}
                >
                  Test
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="sessionTimeout">Session Timeout (hours)</label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                min="1"
                max="168"
              />
            </div>
          </div>
        </div>

        {/* Course Management Settings */}
        <div className="settings-section">
          <h3>📚 Course Management</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="maxStudentsPerCourse">Max Students Per Course</label>
              <input
                type="number"
                id="maxStudentsPerCourse"
                name="maxStudentsPerCourse"
                value={settings.maxStudentsPerCourse}
                onChange={handleInputChange}
                min="1"
                max="1000"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="courseApprovalRequired">Course Approval Required</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="courseApprovalRequired"
                  name="courseApprovalRequired"
                  checked={settings.courseApprovalRequired}
                  onChange={handleInputChange}
                />
                <label htmlFor="courseApprovalRequired"></label>
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="waitlistEnabled">Waitlist System Enabled</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="waitlistEnabled"
                  name="waitlistEnabled"
                  checked={settings.waitlistEnabled}
                  onChange={handleInputChange}
                />
                <label htmlFor="waitlistEnabled"></label>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Settings */}
        <div className="settings-section">
          <h3>👥 User Management</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="registrationEnabled">User Registration Enabled</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="registrationEnabled"
                  name="registrationEnabled"
                  checked={settings.registrationEnabled}
                  onChange={handleInputChange}
                />
                <label htmlFor="registrationEnabled"></label>
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="verificationRequired">Email Verification Required</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="verificationRequired"
                  name="verificationRequired"
                  checked={settings.verificationRequired}
                  onChange={handleInputChange}
                />
                <label htmlFor="verificationRequired"></label>
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="emailNotifications">Email Notifications</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleInputChange}
                />
                <label htmlFor="emailNotifications"></label>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Settings */}
        <div className="settings-section">
          <h3>📁 File Upload Settings</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="maxFileSize">Max File Size (MB)</label>
              <input
                type="number"
                id="maxFileSize"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleInputChange}
                min="1"
                max="100"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="allowedFileTypes">Allowed File Types</label>
              <input
                type="text"
                id="allowedFileTypes"
                name="allowedFileTypes"
                value={settings.allowedFileTypes.join(', ')}
                onChange={(e) => handleArrayChange('allowedFileTypes', e.target.value)}
                placeholder="jpg, png, pdf, doc, docx"
              />
              <small>Separate file types with commas</small>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <h3>🔧 System Settings</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="maintenanceMode">Maintenance Mode</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleMaintenanceToggle}
                />
                <label htmlFor="maintenanceMode"></label>
              </div>
              <small>Enable to put the platform in maintenance mode</small>
            </div>

            <div className="setting-group">
              <label htmlFor="backupFrequency">Backup Frequency</label>
              <select
                id="backupFrequency"
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleInputChange}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="setting-group">
              <label htmlFor="analyticsEnabled">Analytics Enabled</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="analyticsEnabled"
                  name="analyticsEnabled"
                  checked={settings.analyticsEnabled}
                  onChange={handleInputChange}
                />
                <label htmlFor="analyticsEnabled"></label>
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="debugMode">Debug Mode</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="debugMode"
                  name="debugMode"
                  checked={settings.debugMode}
                  onChange={handleInputChange}
                />
                <label htmlFor="debugMode"></label>
              </div>
              <small>Enable for development and troubleshooting</small>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="settings-actions">
          <button 
            type="button" 
            className="admin-btn secondary"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset Changes
          </button>
          <button 
            type="submit" 
            className="admin-btn primary"
            disabled={loading || !hasChanges}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Settings Info */}
      <div className="settings-info">
        <h3>ℹ️ About These Settings</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Platform Name</h4>
            <p>This is the name that appears throughout your platform and in emails.</p>
          </div>
          <div className="info-item">
            <h4>Maintenance Mode</h4>
            <p>When enabled, only administrators can access the platform. Users will see a maintenance message.</p>
          </div>
          <div className="info-item">
            <h4>File Upload Limits</h4>
            <p>Configure maximum file sizes and allowed file types for course materials and user uploads.</p>
          </div>
          <div className="info-item">
            <h4>Session Timeout</h4>
            <p>How long users remain logged in before being automatically logged out.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

