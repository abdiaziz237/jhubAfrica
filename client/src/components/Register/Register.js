import React, { useState } from "react";
import config from "../../config";
import "./Register.css";

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
      const response = await fetch(`${config.API_BASE_URL}/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
            <h1>Create Your Account</h1>
            <p>Start your journey to professional excellence</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              <i className="fas fa-user"></i>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => {
                  handleChange(e);
                  checkPasswordStrength(e.target.value);
                }}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => togglePasswordVisibility("password")}
              >
                <i className="fas fa-eye"></i>
              </button>
            </div>
            {passwordStrength && (
              <div className={`password-strength strength-${passwordStrength.toLowerCase()}`}>
                <i className="fas fa-shield-alt"></i>
                {passwordStrength} password
              </div>
            )}
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="passwordConfirm">
              <i className="fas fa-lock"></i>
              Confirm Password
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="passwordConfirm"
                className={`form-control ${errors.passwordConfirm ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => togglePasswordVisibility("passwordConfirm")}
              >
                <i className="fas fa-eye"></i>
              </button>
            </div>
            {errors.passwordConfirm && <span className="field-error">{errors.passwordConfirm}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              <i className="fas fa-user-graduate"></i>
              I am a
            </label>
            <select
              id="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="professional">Professional</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="referralCode">
              <i className="fas fa-gift"></i>
              Referral Code (Optional)
            </label>
            <input
              type="text"
              id="referralCode"
              className="form-control"
              placeholder="Enter referral code if you have one"
              value={formData.referralCode}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-content">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="btn-content">
                <i className="fas fa-user-plus"></i>
                <span>Create Account</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <div className="auth-divider">
            <span>or</span>
          </div>
          
          <div className="auth-signin">
            <p>Already have an account?</p>
            <a href="/login" className="btn-secondary">
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
