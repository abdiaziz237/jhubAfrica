import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

// If you have these assets, put them in client/public/assets/...
const LOGO_SRC = "/assets/jhub-logo-admin.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const validateEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((val || "").trim());

  const getDeviceInfo = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ipAddress: "" // server fills
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg("");

    if (!validateEmail(email)) {
      setAlertMsg("Please enter a valid email address.");
      return;
    }
    if ((pwd || "").length < 8) {
      setAlertMsg("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // Relative path -> same origin (frontend on :5001). No port hardcoding.
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pwd, deviceInfo: getDeviceInfo() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // Save auth + user
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      // fire-and-forget login activity
      fetch("/api/admin/auth/login-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          userId: data.user?.id || data.user?._id,
          loginTime: new Date().toISOString(),
          deviceInfo: getDeviceInfo(),
        }),
      }).catch(() => {});

      navigate("/admin", { replace: true });
    } catch (err) {
      setAlertMsg(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src={LOGO_SRC} alt="JHUB Africa" />
            <h2 className="h4 mb-0">ADMIN PORTAL</h2>
          </div>

          <div className="login-body">
            {alertMsg ? (
              <div className="alert alert-danger login-alert" role="alert">
                {alertMsg}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@jhubafrica.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="mb-3 password-container">
                <label className="form-label">Password</label>
                <input
                  type={showPwd ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  <i className={`fas ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>

              <div className="d-grid gap-2 mt-4">
                <button className="btn btn-primary btn-login" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2" />
                      LOGIN
                    </>
                  )}
                </button>
              </div>

              <div className="text-end mt-3">
                <a href="/admin/forgot-password" className="text-decoration-none small">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>

          <div className="login-footer">
            <p className="mb-0">&copy; 2025 JHUB Africa. All rights reserved. v2.5.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
