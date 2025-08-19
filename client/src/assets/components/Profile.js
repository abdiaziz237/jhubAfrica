
import React, { useState, useEffect } from 'react';
import './Profile.css';

const mockUserData = {
	name: 'Jane Student',
	email: 'jane.student@example.com',
	phone: '+254 712 345 678',
	location: 'Nairobi, Kenya',
	level: 3,
	points: 1250,
	nextLevel: 2000,
	coursesCompleted: 3,
	totalCourses: 12,
	achievements: 2,
	referralCode: 'JANE1234',
	referrals: 5,
	referralPoints: 500,
	lastLogin: 'Today at 10:30 AM',
};

const Profile = () => {
	const [user, setUser] = useState(mockUserData);

	useEffect(() => {
		// Optionally fetch user data from API here
		// setUser(fetchedUserData);
		const token = localStorage.getItem('authToken');
		if (!token) {
			window.location.href = '/login';
		}
	}, []);

	const initials = user.name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase();

	const handleLogout = (e) => {
		e.preventDefault();
		localStorage.removeItem('authToken');
		window.location.href = '/login';
	};

	const handleCopyReferral = () => {
		navigator.clipboard.writeText(`https://jhubafrica.com/register?ref=${user.referralCode}`);
		alert('Referral link copied to clipboard!');
	};

	return (
		<>
			<style>{`
				:root {
					--primary-color: #003399;
					--secondary-color: #0055ff;
					--accent-color: #00d084;
					--light-bg: #f4f5f6;
					--dark-text: #000a1f;
				}
				.profile-header {
					display: flex;
					align-items: center;
					gap: 30px;
					margin-bottom: 30px;
					background-color: white;
					padding: 30px;
					border-radius: 10px;
					box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
				}
				.profile-avatar {
					width: 120px;
					height: 120px;
					border-radius: 50%;
					background-color: var(--secondary-color);
					color: white;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 2.5rem;
					font-weight: bold;
				}
				.profile-info h1 {
					margin: 0;
					color: var(--dark-text);
				}
				.profile-info p {
					margin: 5px 0 0;
					color: #666;
				}
				.profile-stats {
					display: flex;
					gap: 20px;
					margin-top: 15px;
				}
				.profile-stat {
					text-align: center;
				}
				.profile-stat h3 {
					margin: 0;
					color: var(--primary-color);
				}
				.profile-stat p {
					margin: 5px 0 0;
					font-size: 0.9rem;
				}
				.profile-edit-btn {
					background-color: var(--light-bg);
					border: none;
					padding: 8px 15px;
					border-radius: 5px;
					cursor: pointer;
					font-weight: 500;
					margin-left: auto;
					align-self: flex-start;
				}
				.profile-edit-btn:hover {
					background-color: #e0e0e0;
				}
				.profile-details {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 20px;
					margin-bottom: 30px;
				}
				.detail-card {
					background-color: white;
					border-radius: 10px;
					padding: 20px;
					box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
				}
				.detail-card h2 {
					margin-top: 0;
					color: var(--primary-color);
					font-size: 1.3rem;
				}
				.detail-row {
					display: flex;
					margin-bottom: 15px;
				}
				.detail-label {
					width: 150px;
					font-weight: 600;
					color: var(--dark-text);
				}
				.detail-value {
					flex: 1;
					color: #555;
				}
				@media (max-width: 768px) {
					.profile-header { flex-direction: column; text-align: center; }
					.profile-stats { justify-content: center; }
					.profile-edit-btn { margin-left: 0; align-self: center; }
					.profile-details { grid-template-columns: 1fr; }
				}
			`}</style>

			{/* Navigation */}
			<nav className="navbar">
				<div className="logo">
					<img src="images/logo.png" alt="JHUB Africa" />
					<span className="logo-text">JHUB Africa</span>
				</div>
				<div className="nav-links">
					<a href="/courses">Courses</a>
					<a href="/dashboard">Dashboard</a>
					<a href="/leaderboard">Leaderboard</a>
					<a href="/rewards">Rewards</a>
					<a href="/profile" className="active">Profile</a>
				</div>
				<div className="user-menu">
					<div className="user-avatar">{initials}</div>
				</div>
			</nav>

			<div className="dashboard-container">
				{/* Sidebar */}
				<div className="sidebar">
					<ul className="sidebar-menu">
						<li><a href="/dashboard"><i className="fas fa-home"></i> Dashboard</a></li>
						<li><a href="/my-courses"><i className="fas fa-book-open"></i> My Courses</a></li>
						<li><a href="/achievements"><i className="fas fa-trophy"></i> Achievements</a></li>
						<li><a href="/points"><i className="fas fa-coins"></i> Points Wallet</a></li>
						<li><a href="/referrals"><i className="fas fa-user-plus"></i> Refer Friends</a></li>
						<li><a href="/settings"><i className="fas fa-cog"></i> Settings</a></li>
						<li><a href="#" id="logoutBtn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</a></li>
					</ul>
				</div>

				{/* Main Content */}
				<div className="main-content">
					{/* Profile Header */}
					<div className="profile-header">
						<div className="profile-avatar">{initials}</div>
						<div className="profile-info">
							<h1>{user.name}</h1>
							<p>Level {user.level} Explorer | Joined March 2023</p>
							<div className="profile-stats">
								<div className="profile-stat">
									<h3>{user.points.toLocaleString()}</h3>
									<p>XP Points</p>
								</div>
								<div className="profile-stat">
									<h3>{user.coursesCompleted}</h3>
									<p>Courses</p>
								</div>
								<div className="profile-stat">
									<h3>{user.referrals}</h3>
									<p>Referrals</p>
								</div>
							</div>
						</div>
						<button className="profile-edit-btn" onClick={() => window.location.href='/settings'}>
							<i className="fas fa-edit"></i> Edit Profile
						</button>
					</div>

					{/* Profile Details */}
					<div className="profile-details">
						<div className="detail-card">
							<h2>Personal Information</h2>
							<div className="detail-row">
								<div className="detail-label">Full Name</div>
								<div className="detail-value">{user.name}</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Email</div>
								<div className="detail-value">{user.email}</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Phone</div>
								<div className="detail-value">{user.phone}</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Location</div>
								<div className="detail-value">{user.location}</div>
							</div>
						</div>

						<div className="detail-card">
							<h2>Learning Progress</h2>
							<div className="detail-row">
								<div className="detail-label">Current Level</div>
								<div className="detail-value">{user.level} Explorer</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">XP Points</div>
								<div className="detail-value">{user.points.toLocaleString()} / {user.nextLevel.toLocaleString()} to next level</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Courses Completed</div>
								<div className="detail-value">{user.coursesCompleted} of {user.totalCourses}</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Achievements</div>
								<div className="detail-value">{user.achievements} unlocked</div>
							</div>
						</div>

						<div className="detail-card">
							<h2>Referral Program</h2>
							<div className="detail-row">
								<div className="detail-label">Your Referral Code</div>
								<div className="detail-value">
									<strong>{user.referralCode}</strong>
									<button onClick={handleCopyReferral} style={{marginLeft: '10px', padding: '3px 8px', fontSize: '0.8rem'}}>
										<i className="fas fa-copy"></i> Copy
									</button>
								</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Friends Referred</div>
								<div className="detail-value">{user.referrals}</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Referral Points</div>
								<div className="detail-value">{user.referralPoints.toLocaleString()} XP</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Referral Link</div>
								<div className="detail-value">
									<input type="text" value={`https://jhubafrica.com/register?ref=${user.referralCode}`} readOnly style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px'}} />
								</div>
							</div>
						</div>

						<div className="detail-card">
							<h2>Account Security</h2>
							<div className="detail-row">
								<div className="detail-label">Password</div>
								<div className="detail-value">
									********
									<a href="/change-password" style={{marginLeft: '10px'}}>Change</a>
								</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Two-Factor Auth</div>
								<div className="detail-value">
									Not enabled
									<a href="/settings#security" style={{marginLeft: '10px'}}>Enable</a>
								</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Last Login</div>
								<div className="detail-value">{user.lastLogin}</div>
							</div>
							<div className="detail-row">
								<div className="detail-label">Account Status</div>
								<div className="detail-value">Active</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Profile;
