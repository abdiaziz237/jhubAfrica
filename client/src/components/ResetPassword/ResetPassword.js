import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./ResetPassword.css";
import config from "../../config";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setMessage("✅ Password reset successfully! Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 2000);
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
        <h1>Reset Password</h1>
        <p>Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
