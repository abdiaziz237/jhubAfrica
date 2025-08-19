

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const API_BASE_URL = 'http://localhost:5000'; // Update this if your backend is elsewhere
const DEBUG_MODE = true; // Set to false in production

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setPasswordError('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            if (DEBUG_MODE) console.log('Attempting login with:', { email, password });
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if (DEBUG_MODE) console.log('Response status:', response.status);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || `Login failed with status ${response.status}`);
            }
            if (!data.token) {
                throw new Error('No authentication token received');
            }
            localStorage.setItem('authToken', data.token);
            if (DEBUG_MODE) {
                console.log('Login successful, token stored:', data.token);
                console.log('Redirecting to dashboard...');
            }
            window.location.href = 'dashboard.html';
        } catch (error) {
            if (DEBUG_MODE) console.error('Login error:', error);
            if (error.message.includes('Failed to fetch')) {
                setPasswordError('Unable to connect to server. Please check your connection.');
            } else if (error.message.includes('401')) {
                setPasswordError('Invalid email or password');
            } else {
                setPasswordError(error.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <img src="images/logo.png" alt="JHUB Africa" className="auth-logo" />
                <h1>Welcome Back</h1>
                <p>Login to continue your learning journey</p>
            </div>

            <form id="loginForm" onSubmit={handleSubmit}>
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
                        autoComplete="username"
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
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <i
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                            id="togglePassword"
                            style={{ cursor: 'pointer' }}
                            onClick={handleTogglePassword}
                        ></i>
                    </div>
                    {passwordError && <div className="error-message" id="passwordError">{passwordError}</div>}
                    <div className="forgot-password">
                        <a href="forgot-password.html">Forgot password?</a>
                    </div>
                </div>

                <button type="submit" className="btn" id="loginBtn" disabled={loading}>
                    <span id="btnText" style={{ display: loading ? 'none' : 'inline' }}>Login</span>
                    <span id="btnSpinner" style={{ display: loading ? 'inline' : 'none' }}>
                        <i className="fas fa-spinner fa-spin"></i> Processing...
                    </span>
                </button>
            </form>

            <div className="auth-footer">
                Don't have an account?{' '}
                <a href="register.html">Sign Up</a>
            </div>
        </div>
    );
};

export default Login;
