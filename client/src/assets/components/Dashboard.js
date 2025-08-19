import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const mockUserData = {
    name: 'Jane Student',
    points: 1250,
    courses: 3,
    achievements: 2,
    referrals: 5,
};

const Dashboard = () => {
    const [user, setUser] = useState(mockUserData);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        // Optionally, fetch user data from backend here
        // fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        //   .then(res => res.json())
        //   .then(data => setUser(data))
        //   .catch(() => { localStorage.removeItem('authToken'); window.location.href = 'login.html'; });
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    };

    // Get initials for avatar
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <>
            {/* Navigation */}
            <nav className="navbar">
                <div className="logo">
                    <img src="images/logo.png" alt="JHUB Africa" />
                    <span className="logo-text">JHUB Africa</span>
                </div>
                <div className="nav-links">
                    <a href="courses.html">Courses</a>
                    <a href="dashboard.html" className="active">Dashboard</a>
                    <a href="leaderboard.html">Leaderboard</a>
                    <a href="rewards.html">Rewards</a>
                    <a href="profile.html">Profile</a>
                </div>
                <div className="user-menu">
                    <div className="user-avatar">{initials}</div>
                </div>
            </nav>

            {/* Dashboard Layout */}
            <div className="dashboard-container">
                {/* Sidebar */}
                <div className="sidebar">
                    <ul className="sidebar-menu">
                        <li><a href="dashboard.html" className="active"><i className="fas fa-home"></i> Dashboard</a></li>
                        <li><a href="my-courses.html"><i className="fas fa-book-open"></i> My Courses</a></li>
                        <li><a href="achievements.html"><i className="fas fa-trophy"></i> Achievements</a></li>
                        <li><a href="points.html"><i className="fas fa-coins"></i> Points Wallet</a></li>
                        <li><a href="referrals.html"><i className="fas fa-user-plus"></i> Refer Friends</a></li>
                        <li><a href="settings.html"><i className="fas fa-cog"></i> Settings</a></li>
                        <li><a href="#" id="logoutBtn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Welcome Banner */}
                    <div className="welcome-banner">
                        <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p>Continue your learning journey and earn more points today</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <i className="fas fa-bolt"></i>
                            <h3>{user.points.toLocaleString()} XP</h3>
                            <p>Total Points Earned</p>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-book"></i>
                            <h3>{user.courses}</h3>
                            <p>Courses Enrolled</p>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-trophy"></i>
                            <h3>{user.achievements}</h3>
                            <p>Achievements Unlocked</p>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-users"></i>
                            <h3>{user.referrals}</h3>
                            <p>Friends Referred</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="activity-section">
                        <div className="section-header">
                            <h2>Recent Activity</h2>
                            <a href="activity.html">View All</a>
                        </div>
                        <ul className="activity-list">
                            <li className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-book"></i>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">Course Completed</h4>
                                    <p className="activity-desc">IC3 Digital Literacy Certification</p>
                                    <p className="activity-time">2 hours ago</p>
                                </div>
                                <div className="activity-points">+250 XP</div>
                            </li>
                            <li className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">Friend Referred</h4>
                                    <p className="activity-desc">Sarah K. joined using your code</p>
                                    <p className="activity-time">1 day ago</p>
                                </div>
                                <div className="activity-points">+100 XP</div>
                            </li>
                            <li className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-coins"></i>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">Points Redeemed</h4>
                                    <p className="activity-desc">500 points converted to KES 500</p>
                                    <p className="activity-time">3 days ago</p>
                                </div>
                                <div className="activity-points">-500 XP</div>
                            </li>
                            <li className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-award"></i>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">Achievement Unlocked</h4>
                                    <p className="activity-desc">Fast Learner - First course completed</p>
                                    <p className="activity-time">5 days ago</p>
                                </div>
                                <div className="activity-points">+50 XP</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
