import React, { useState } from "react";
import config from "../../config";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // TEMPORARY: Testing new state management approach
  // const [userSession, setUserSession] = useState(null);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // TODO: Maybe add more validation later
  // HACK: Quick email validation - should be improved

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
    // console.log('Login attempt for:', email); // debug

    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      // console.log('Login response:', data); // debug
      
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401) {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        } else if (res.status === 403) {
          throw new Error("Your account is pending verification by an administrator. Please wait for approval.");
        } else {
          throw new Error(data.message || "Login failed. Please try again.");
        }
      }
      // FIXME: Error handling could be better

      if (!data.token) throw new Error("No authentication token received");

      // Store token based on user role
      if (data.user && data.user.role === 'admin') {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        // Redirect admin to admin dashboard
        window.location.href = "/admin/dashboard";
      } else {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Check if user needs to be redirected to dashboard or verification page
        if (data.user && data.user.verificationStatus === 'pending') {
          // Show verification pending message
          setError("Your account is pending verification by an administrator. Please wait for approval.");
          return;
        }
        
        // Redirect to dashboard on successful login
        window.location.href = "/dashboard";
      }
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
              <span>Premium Learning</span>
            </div>
          </div>
          
          <div className="auth-welcome">
            <h1>Welcome Back</h1>
            <p>Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <div className="forgot-password">
            <a href="/forgot-password">
              <i className="fas fa-key"></i>
              Forgot your password?
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
