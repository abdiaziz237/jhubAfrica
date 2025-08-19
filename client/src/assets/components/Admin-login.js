import React, { useState } from 'react';
import './Admin-login.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Add validation and API call here
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/assets/jhub-logo-admin.png" alt="JHUB Africa" />
          <h2 className="h4 mb-0">ADMIN PORTAL</h2>
        </div>
        <div className="login-body">
          {error && <div className="alert alert-danger login-alert" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(s => !s)}
                tabIndex={-1}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <button type="submit" className="btn btn-login w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        <div className="login-footer">
          <p className="mb-0">&copy; 2025 JHUB Africa. All rights reserved. v2.5.1</p>
        </div>
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;