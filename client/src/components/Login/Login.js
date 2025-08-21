import React, { useState } from "react";
import "./Login.css";

const API_BASE_URL = "http://localhost:5001"; // change for production

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
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (!data.token) throw new Error("No authentication token received");

      localStorage.setItem("authToken", data.token);
      window.location.href = "/dashboard"; // React route later
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img src="/images/logo.png" alt="JHUB Africa" className="auth-logo" />
        <h1>Welcome Back</h1>
        <p>Login to continue your learning journey</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-icon">
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="fas fa-eye"></i>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Processing...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="forgot-password">
        <a href="/forgot-password">Forgot password?</a>
      </div>

      <div className="auth-footer">
        Don’t have an account? <a href="/register">Sign Up</a>
      </div>
    </div>
  );
}
