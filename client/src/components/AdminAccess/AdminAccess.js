import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAccess.css';

const AdminAccess = () => {
  const [showAccess, setShowAccess] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hidden admin access - only shown after specific actions
  const handleSecretAccess = () => {
    setShowAccess(true);
  };

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    
    // Simple access code - you can make this more complex
    if (accessCode === 'JHUB-ADMIN-2024' || accessCode === 'admin123') {
      navigate('/admin/login');
    } else {
      setError('Invalid access code');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Hidden trigger - only accessible through specific actions
  const triggerAdminAccess = () => {
    // This could be triggered by:
    // - A hidden button in the footer
    // - Specific URL patterns
    // - Time-based access
    // - IP-based restrictions
    handleSecretAccess();
  };

  // Remove keyboard shortcut functionality
  // Component is now completely hidden by default

  if (!showAccess) {
    return null; // Hidden by default
  }

  return (
    <div className="admin-access-overlay">
      <div className="admin-access-modal">
        <h2>🔒 Admin Access</h2>
        <p>Enter access code to continue</p>
        
        <form onSubmit={handleAccessSubmit}>
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Enter access code"
            className="admin-access-input"
            autoFocus
          />
          
          {error && <p className="admin-access-error">{error}</p>}
          
          <div className="admin-access-buttons">
            <button type="submit" className="admin-access-submit">
              Access Admin
            </button>
            <button 
              type="button" 
              className="admin-access-cancel"
              onClick={() => setShowAccess(false)}
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="admin-access-hint">
          <small>💡 Hint: Check your admin setup documentation</small>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;
