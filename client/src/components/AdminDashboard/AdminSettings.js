import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      platformName: 'JHub Learning Platform',
      platformDescription: 'Advanced learning management system',
      contactEmail: 'admin@jhub.com',
      supportPhone: '+1-555-0123',
      timezone: 'UTC',
      language: 'en',
    maintenanceMode: false,
      maintenanceMessage: 'Platform is under maintenance. Please check back later.'
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      twoFactorRequired: false,
      ipWhitelist: [],
      allowedDomains: []
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@jhub.com',
      fromName: 'JHub Platform',
      emailVerificationRequired: true,
      welcomeEmailTemplate: 'Welcome to JHub!',
      passwordResetTemplate: 'Reset your password',
      notificationEmails: true
    },
    integrations: {
      googleAnalytics: '',
      facebookPixel: '',
      stripeEnabled: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
      paypalEnabled: false,
      paypalClientId: '',
      paypalSecret: '',
      zoomEnabled: false,
      zoomApiKey: '',
      zoomApiSecret: ''
    },
    system: {
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    backupFrequency: 'daily',
      backupRetention: 30,
      logLevel: 'info',
      autoUpdate: true,
      performanceMode: 'balanced',
      cacheEnabled: true,
      cdnEnabled: false
    }
  });
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
      const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      };

      // Fetch settings from server (placeholder for now)
      // const response = await fetch('/api/v1/admin/settings', { headers });
      // if (response.ok) {
      //   const data = await response.json();
      //   setSettings(data);
      //   setOriginalSettings(data);
      // }

      // For now, use default settings
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Save settings to server
      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setHasChanges(false);
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setHasChanges(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch('/api/v1/admin/settings/test-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: settings.email.fromEmail,
          subject: 'Test Email from JHub',
          message: 'This is a test email to verify your email configuration.'
        })
      });

      if (response.ok) {
        alert('Test email sent successfully!');
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      const newMaintenanceMode = !settings.general.maintenanceMode;
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch('/api/v1/admin/system/maintenance', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          enabled: newMaintenanceMode,
          message: settings.general.maintenanceMessage
        })
      });

      if (response.ok) {
        handleSettingChange('general', 'maintenanceMode', newMaintenanceMode);
        alert(`Maintenance mode ${newMaintenanceMode ? 'enabled' : 'disabled'} successfully!`);
      } else {
        throw new Error('Failed to toggle maintenance mode');
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      alert('Failed to toggle maintenance mode. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings-header">
        <h1><i className="fas fa-cog"></i> Platform Settings</h1>
        <p>Configure platform parameters, security, and integrations</p>
      </div>

      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <i className="fas fa-sliders-h"></i> General
        </button>
        <button 
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i> Security
        </button>
        <button 
          className={`settings-tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          <i className="fas fa-envelope"></i> Email
        </button>
        <button 
          className={`settings-tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <i className="fas fa-plug"></i> Integrations
        </button>
          <button 
          className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
          >
          <i className="fas fa-server"></i> System
          </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
        <div className="settings-section">
            <h2>General Platform Settings</h2>
          <div className="settings-grid">
            <div className="setting-group">
                <label>Platform Name</label>
              <input
                type="text"
                  value={settings.general.platformName}
                  onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                placeholder="Enter platform name"
              />
            </div>

            <div className="setting-group">
                <label>Platform Description</label>
                <textarea
                  value={settings.general.platformDescription}
                  onChange={(e) => handleSettingChange('general', 'platformDescription', e.target.value)}
                  placeholder="Enter platform description"
                  rows="3"
                />
              </div>

              <div className="setting-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                />
              </div>

              <div className="setting-group">
                <label>Support Phone</label>
                <input
                  type="tel"
                  value={settings.general.supportPhone}
                  onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
                  placeholder="Enter support phone"
                />
              </div>

              <div className="setting-group">
                <label>Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Language</label>
                <select
                  value={settings.general.language}
                  onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div className="setting-group maintenance-toggle">
                <label>Maintenance Mode</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.general.maintenanceMode}
                    onChange={handleMaintenanceToggle}
                  />
                  <label htmlFor="maintenanceMode" className="toggle-label"></label>
              </div>
                <small>Enable to put platform in maintenance mode</small>
            </div>

            <div className="setting-group">
                <label>Maintenance Message</label>
                <textarea
                  value={settings.general.maintenanceMessage}
                  onChange={(e) => handleSettingChange('general', 'maintenanceMessage', e.target.value)}
                  placeholder="Enter maintenance message"
                  rows="3"
                  disabled={!settings.general.maintenanceMode}
              />
            </div>
          </div>
        </div>
        )}

        {activeTab === 'security' && (
        <div className="settings-section">
            <h2>Security Settings</h2>
          <div className="settings-grid">
            <div className="setting-group">
                <label>Minimum Password Length</label>
              <input
                type="number"
                  min="6"
                  max="20"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
              />
            </div>

            <div className="setting-group">
                <label>Require Special Characters</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="requireSpecialChars"
                    checked={settings.security.requireSpecialChars}
                    onChange={(e) => handleSettingChange('security', 'requireSpecialChars', e.target.checked)}
                  />
                  <label htmlFor="requireSpecialChars" className="toggle-label"></label>
              </div>
            </div>

            <div className="setting-group">
                <label>Require Numbers</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="requireNumbers"
                    checked={settings.security.requireNumbers}
                    onChange={(e) => handleSettingChange('security', 'requireNumbers', e.target.checked)}
                  />
                  <label htmlFor="requireNumbers" className="toggle-label"></label>
          </div>
        </div>

            <div className="setting-group">
                <label>Require Uppercase</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="requireUppercase"
                    checked={settings.security.requireUppercase}
                    onChange={(e) => handleSettingChange('security', 'requireUppercase', e.target.checked)}
                  />
                  <label htmlFor="requireUppercase" className="toggle-label"></label>
              </div>
            </div>

            <div className="setting-group">
                <label>Session Timeout (seconds)</label>
                <input
                  type="number"
                  min="300"
                  max="86400"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <div className="setting-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>

              <div className="setting-group">
                <label>Lockout Duration (seconds)</label>
                <input
                  type="number"
                  min="300"
                  max="3600"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                />
            </div>

            <div className="setting-group">
                <label>Two-Factor Authentication Required</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="twoFactorRequired"
                    checked={settings.security.twoFactorRequired}
                    onChange={(e) => handleSettingChange('security', 'twoFactorRequired', e.target.checked)}
                  />
                  <label htmlFor="twoFactorRequired" className="toggle-label"></label>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'email' && (
        <div className="settings-section">
            <h2>Email Configuration</h2>
          <div className="settings-grid">
            <div className="setting-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                  placeholder="e.g., smtp.gmail.com"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Port</label>
              <input
                type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
                  placeholder="587"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
                  placeholder="Enter SMTP username"
                />
              </div>

              <div className="setting-group">
                <label>SMTP Password</label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                  placeholder="Enter SMTP password"
                />
              </div>

              <div className="setting-group">
                <label>From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                  placeholder="noreply@jhub.com"
              />
            </div>

            <div className="setting-group">
                <label>From Name</label>
              <input
                type="text"
                  value={settings.email.fromName}
                  onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                  placeholder="JHub Platform"
                />
              </div>

              <div className="setting-group">
                <label>Email Verification Required</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="emailVerificationRequired"
                    checked={settings.email.emailVerificationRequired}
                    onChange={(e) => handleSettingChange('email', 'emailVerificationRequired', e.target.checked)}
                  />
                  <label htmlFor="emailVerificationRequired" className="toggle-label"></label>
                </div>
              </div>

              <div className="setting-group">
                <label>Send Notification Emails</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="notificationEmails"
                    checked={settings.email.notificationEmails}
                    onChange={(e) => handleSettingChange('email', 'notificationEmails', e.target.checked)}
                  />
                  <label htmlFor="notificationEmails" className="toggle-label"></label>
                </div>
              </div>

              <div className="setting-group full-width">
                <button className="admin-btn secondary" onClick={handleTestEmail}>
                  <i className="fas fa-paper-plane"></i> Send Test Email
                </button>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'integrations' && (
        <div className="settings-section">
            <h2>Third-Party Integrations</h2>
          <div className="settings-grid">
            <div className="setting-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.integrations.googleAnalytics}
                  onChange={(e) => handleSettingChange('integrations', 'googleAnalytics', e.target.value)}
                  placeholder="GA-XXXXXXXXX"
                />
              </div>

              <div className="setting-group">
                <label>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.integrations.facebookPixel}
                  onChange={(e) => handleSettingChange('integrations', 'facebookPixel', e.target.value)}
                  placeholder="XXXXXXXXXX"
                />
              </div>

              <div className="setting-group">
                <label>Enable Stripe Payments</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="stripeEnabled"
                    checked={settings.integrations.stripeEnabled}
                    onChange={(e) => handleSettingChange('integrations', 'stripeEnabled', e.target.checked)}
                  />
                  <label htmlFor="stripeEnabled" className="toggle-label"></label>
                </div>
              </div>

              {settings.integrations.stripeEnabled && (
                <>
                  <div className="setting-group">
                    <label>Stripe Publishable Key</label>
                    <input
                      type="text"
                      value={settings.integrations.stripePublishableKey}
                      onChange={(e) => handleSettingChange('integrations', 'stripePublishableKey', e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div className="setting-group">
                    <label>Stripe Secret Key</label>
                    <input
                      type="password"
                      value={settings.integrations.stripeSecretKey}
                      onChange={(e) => handleSettingChange('integrations', 'stripeSecretKey', e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                </>
              )}

              <div className="setting-group">
                <label>Enable PayPal</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="paypalEnabled"
                    checked={settings.integrations.paypalEnabled}
                    onChange={(e) => handleSettingChange('integrations', 'paypalEnabled', e.target.checked)}
                  />
                  <label htmlFor="paypalEnabled" className="toggle-label"></label>
                </div>
              </div>

              {settings.integrations.paypalEnabled && (
                <>
                  <div className="setting-group">
                    <label>PayPal Client ID</label>
                    <input
                      type="text"
                      value={settings.integrations.paypalClientId}
                      onChange={(e) => handleSettingChange('integrations', 'paypalClientId', e.target.value)}
                      placeholder="Enter PayPal Client ID"
                    />
                  </div>
                  <div className="setting-group">
                    <label>PayPal Secret</label>
                    <input
                      type="password"
                      value={settings.integrations.paypalSecret}
                      onChange={(e) => handleSettingChange('integrations', 'paypalSecret', e.target.value)}
                      placeholder="Enter PayPal Secret"
                    />
                  </div>
                </>
              )}

              <div className="setting-group">
                <label>Enable Zoom Integration</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="zoomEnabled"
                    checked={settings.integrations.zoomEnabled}
                    onChange={(e) => handleSettingChange('integrations', 'zoomEnabled', e.target.checked)}
                  />
                  <label htmlFor="zoomEnabled" className="toggle-label"></label>
                </div>
              </div>

              {settings.integrations.zoomEnabled && (
                <>
                  <div className="setting-group">
                    <label>Zoom API Key</label>
                    <input
                      type="text"
                      value={settings.integrations.zoomApiKey}
                      onChange={(e) => handleSettingChange('integrations', 'zoomApiKey', e.target.value)}
                      placeholder="Enter Zoom API Key"
                    />
                  </div>
                  <div className="setting-group">
                    <label>Zoom API Secret</label>
                    <input
                      type="password"
                      value={settings.integrations.zoomApiSecret}
                      onChange={(e) => handleSettingChange('integrations', 'zoomApiSecret', e.target.value)}
                      placeholder="Enter Zoom API Secret"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="settings-section">
            <h2>System Configuration</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label>Max File Size (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.system.maxFileSize}
                  onChange={(e) => handleSettingChange('system', 'maxFileSize', parseInt(e.target.value))}
                />
              </div>

              <div className="setting-group">
                <label>Allowed File Types</label>
                <input
                  type="text"
                  value={settings.system.allowedFileTypes.join(', ')}
                  onChange={(e) => handleSettingChange('system', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="jpg, png, pdf, doc, docx"
                />
            </div>

            <div className="setting-group">
                <label>Backup Frequency</label>
              <select
                  value={settings.system.backupFrequency}
                  onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="setting-group">
                <label>Backup Retention (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.system.backupRetention}
                  onChange={(e) => handleSettingChange('system', 'backupRetention', parseInt(e.target.value))}
                />
              </div>

              <div className="setting-group">
                <label>Log Level</label>
                <select
                  value={settings.system.logLevel}
                  onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Auto Update</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="autoUpdate"
                    checked={settings.system.autoUpdate}
                    onChange={(e) => handleSettingChange('system', 'autoUpdate', e.target.checked)}
                  />
                  <label htmlFor="autoUpdate" className="toggle-label"></label>
                </div>
              </div>

              <div className="setting-group">
                <label>Performance Mode</label>
                <select
                  value={settings.system.performanceMode}
                  onChange={(e) => handleSettingChange('system', 'performanceMode', e.target.value)}
                >
                  <option value="balanced">Balanced</option>
                  <option value="performance">Performance</option>
                  <option value="power-saver">Power Saver</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Enable Caching</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="cacheEnabled"
                    checked={settings.system.cacheEnabled}
                    onChange={(e) => handleSettingChange('system', 'cacheEnabled', e.target.checked)}
                  />
                  <label htmlFor="cacheEnabled" className="toggle-label"></label>
              </div>
            </div>

            <div className="setting-group">
                <label>Enable CDN</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                    id="cdnEnabled"
                    checked={settings.system.cdnEnabled}
                    onChange={(e) => handleSettingChange('system', 'cdnEnabled', e.target.checked)}
                  />
                  <label htmlFor="cdnEnabled" className="toggle-label"></label>
              </div>
            </div>
          </div>
          </div>
        )}
        </div>

        <div className="settings-actions">
          <button 
            className="admin-btn secondary"
          onClick={handleResetSettings}
            disabled={!hasChanges}
          >
          <i className="fas fa-undo"></i> Reset Changes
          </button>
          <button 
            className="admin-btn primary"
          onClick={handleSaveSettings}
          disabled={!hasChanges || loading}
          >
          <i className="fas fa-save"></i> Save Settings
          </button>
      </div>
    </div>
  );
};

export default AdminSettings;

