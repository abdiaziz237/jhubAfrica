import React, { useState } from "react";
import config from "../../config";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (!data.token) throw new Error("No authentication token received");

      localStorage.setItem("authToken", data.token);
      
      // Check if user needs to be redirected to dashboard or verification page
      if (data.user && data.user.verificationStatus === 'pending') {
        // Show verification pending message
        setError("Your account is pending verification by an administrator. Please wait for approval.");
        return;
      }
      
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-background-overlay"></div>
        <div className="auth-background-pattern"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-container">
            <div className="auth-logo">
              <i className="fas fa-crown"></i>
            </div>
            <div className="auth-brand">
              <h2>JHUB Africa</h2>
              <span>Premium Learning Platform</span>
            </div>
          </div>
          
          <div className="auth-welcome">
            <h1>Welcome Back</h1>
            <p>Continue your journey to professional excellence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle">
                <i className="fas fa-eye"></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-content">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Signing In...</span>
              </span>
            ) : (
              <span className="btn-content">
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="forgot-password">
            <a href="/forgot-password">
              <i className="fas fa-key"></i>
              Forgot your password?
            </a>
          </div>
          
          <div className="verification-links">
            <a href="/verification-status">
              <i className="fas fa-user-check"></i>
              Check Verification Status
            </a>
          </div>
          
          <div className="auth-divider">
            <span>or</span>
          </div>
          
          <div className="auth-signup">
            <p>Don't have an account?</p>
            <a href="/register" className="btn-secondary">
              <i className="fas fa-user-plus"></i>
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
