import React, { useState } from "react";
import "./Register.css";

const API_BASE_URL = "http://localhost:5002"; // change for production

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    referralCode: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const togglePasswordVisibility = (id) => {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (password.length === 0) setPasswordStrength("");
    else if (strength <= 2) setPasswordStrength("Weak");
    else if (strength <= 4) setPasswordStrength("Medium");
    else setPasswordStrength("Strong");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let newErrors = {};

    if (!formData.name) newErrors.name = "Please enter your full name";
    if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.passwordConfirm)
      newErrors.passwordConfirm = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // matches backend schema
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      window.location.href = "/login";
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img src="/images/logo.png" alt="JHUB Africa" className="auth-logo" />
        <h1>Create Your Account</h1>
        <p>Start your learning journey and earn rewards</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            className="form-control"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-icon">
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                checkPasswordStrength(e.target.value);
              }}
              required
            />
            <i
              className="fas fa-eye"
              onClick={() => togglePasswordVisibility("password")}
            ></i>
          </div>
          {passwordStrength && (
            <div
              className={`password-strength strength-${passwordStrength.toLowerCase()}`}
            >
              {passwordStrength} password
            </div>
          )}
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <div className="input-icon">
            <input
              type="password"
              id="passwordConfirm"
              className="form-control"
              placeholder="Confirm your password"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
            <i
              className="fas fa-eye"
              onClick={() => togglePasswordVisibility("passwordConfirm")}
            ></i>
          </div>
          {errors.passwordConfirm && (
            <div className="error-message">{errors.passwordConfirm}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="referralCode">Referral Code (Optional)</label>
          <input
            type="text"
            id="referralCode"
            className="form-control"
            placeholder="Enter referral code if any"
            value={formData.referralCode}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            className="form-control"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : "Register Now"}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <a href="/login">Sign In</a>
      </div>
    </div>
  );
};

export default Register;
