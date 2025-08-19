import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        if (password.length === 0) {
            setPasswordStrength('');
        } else if (strength <= 2) {
            setPasswordStrength('Weak password');
        } else if (strength <= 4) {
            setPasswordStrength('Medium strength');
        } else {
            setPasswordStrength('Strong password');
        }
    };

    const resetErrors = () => {
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        resetErrors();
        let isValid = true;
        if (name.trim() === '') {
            setNameError('Please enter your full name');
            isValid = false;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            isValid = false;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }
        if (!isValid) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, confirmPassword, referralCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            window.location.href = 'login.html?registered=true';
        } catch (error) {
            setEmailError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <img src="images/logo.png" alt="JHUB Africa" className="auth-logo" />
                <h1>Create Your Account</h1>
                <p>Start your learning journey and earn rewards</p>
            </div>
            <form id="registerForm" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Enter your full name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && <div className="error-message" id="nameError">{nameError}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailError && <div className="error-message" id="emailError">{emailError}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-icon">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className="form-control"
                            placeholder="Create a password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                checkPasswordStrength(e.target.value);
                            }}
                        />
                        <i
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                            id="togglePassword"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowPassword((prev) => !prev)}
                        ></i>
                    </div>
                    {passwordStrength && <div className="password-strength" id="passwordStrength">{passwordStrength}</div>}
                    {passwordError && <div className="error-message" id="passwordError">{passwordError}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-icon">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            className="form-control"
                            placeholder="Confirm your password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <i
                            className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                            id="toggleConfirmPassword"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        ></i>
                    </div>
                    {confirmPasswordError && <div className="error-message" id="confirmPasswordError">{confirmPasswordError}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="referralCode">Referral Code (Optional)</label>
                    <input
                        type="text"
                        id="referralCode"
                        className="form-control"
                        placeholder="Enter referral code if any"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn" id="registerButton" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Registering...</> : 'Register Now'}
                </button>
            </form>
            <div className="auth-footer">
                Already have an account? <a href="login.html">Sign In</a>
            </div>
        </div>
    );
};

export default Register;
