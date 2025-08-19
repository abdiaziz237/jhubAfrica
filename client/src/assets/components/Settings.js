import React, { useState, useRef } from 'react';
import './Settings.css';

const initialUserData = {
	firstName: 'Jane',
	lastName: 'Student',
	email: 'jane.student@example.com',
	phone: '+254712345678',
	bio: 'Digital skills enthusiast currently learning web development and digital marketing through JHUB Africa.',
	avatar: 'images/avatar-placeholder.jpg',
	notifications: {
		email: {
			courseUpdates: true,
			promotional: true,
			accountActivity: true,
		},
		push: {
			newCourses: true,
			deadlineReminders: true,
			pointsEarned: true,
		},
	},
	privacy: {
		visibility: 'public',
		shareAnalytics: true,
		partnerOffers: false,
	},
};

const Settings = () => {
	const [activeTab, setActiveTab] = useState('profile');
	const [userData, setUserData] = useState(initialUserData);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState(userData.avatar);
	const fileInputRef = useRef(null);

	// Tab switching
	const handleTabClick = (tab) => setActiveTab(tab);

	// Profile form handlers
	const handleProfileChange = (e) => {
		const { name, value } = e.target;
		setUserData((prev) => ({ ...prev, [name]: value }));
	};

	// Avatar upload
	const handleAvatarUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				setAvatarUrl(ev.target.result);
				alert('Profile photo updated successfully!');
			};
			reader.readAsDataURL(file);
		}
	};
	const handleUploadBtn = () => fileInputRef.current && fileInputRef.current.click();
	const handleRemoveAvatar = () => {
		setAvatarUrl('images/avatar-placeholder.jpg');
		alert('Profile photo removed. A default avatar will be shown.');
	};

	// Notification preferences
	const handleNotificationChange = (e) => {
		const { id, checked } = e.target;
		setUserData((prev) => {
			const updated = { ...prev };
			if (id in updated.notifications.email) {
				updated.notifications.email[id] = checked;
			} else if (id in updated.notifications.push) {
				updated.notifications.push[id] = checked;
			}
			return updated;
		});
	};

	// Privacy settings
	const handlePrivacyChange = (e) => {
		const { id, checked, value, type } = e.target;
		setUserData((prev) => {
			const updated = { ...prev };
			if (type === 'radio') {
				updated.privacy.visibility = value;
			} else if (id in updated.privacy) {
				updated.privacy[id] = checked;
			}
			return updated;
		});
	};

	// Password form
	const handleShowPasswordForm = () => setShowPasswordForm(true);
	const handleCancelPasswordForm = (e) => {
		e.preventDefault();
		setShowPasswordForm(false);
	};

	// Render
	return (
		<div className="main-content">
			<div className="settings-header">
				<h1>Account Settings</h1>
			</div>
			<div className="settings-tabs">
				<div className={`settings-tab${activeTab === 'profile' ? ' active' : ''}`} onClick={() => handleTabClick('profile')} data-tab="profile">Profile</div>
				<div className={`settings-tab${activeTab === 'security' ? ' active' : ''}`} onClick={() => handleTabClick('security')} data-tab="security">Security</div>
				<div className={`settings-tab${activeTab === 'notifications' ? ' active' : ''}`} onClick={() => handleTabClick('notifications')} data-tab="notifications">Notifications</div>
				<div className={`settings-tab${activeTab === 'privacy' ? ' active' : ''}`} onClick={() => handleTabClick('privacy')} data-tab="privacy">Privacy</div>
				<div className={`settings-tab${activeTab === 'billing' ? ' active' : ''}`} onClick={() => handleTabClick('billing')} data-tab="billing">Billing</div>
			</div>

			{/* Profile Tab */}
			{activeTab === 'profile' && (
				<div className="settings-section" id="profile-tab">
					<h2 className="section-title"><i className="fas fa-user"></i> Profile Information</h2>
					<div className="avatar-upload">
						<div className="avatar-preview">
							<img src={avatarUrl} alt="User Avatar" id="avatarPreview" />
						</div>
						<div className="avatar-upload-actions">
							<button className="btn btn-outline btn-sm" type="button" onClick={handleUploadBtn}>
								<i className="fas fa-upload"></i> Upload New Photo
							</button>
							<input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleAvatarUpload} />
							<button className="btn btn-outline btn-sm" type="button" onClick={handleRemoveAvatar}>
								<i className="fas fa-trash"></i> Remove Photo
							</button>
						</div>
					</div>
					<div className="form-row">
						<div className="form-group">
							<label htmlFor="firstName">First Name</label>
							<input type="text" id="firstName" name="firstName" value={userData.firstName} onChange={handleProfileChange} />
						</div>
						<div className="form-group">
							<label htmlFor="lastName">Last Name</label>
							<input type="text" id="lastName" name="lastName" value={userData.lastName} onChange={handleProfileChange} />
						</div>
					</div>
					<div className="form-group">
						<label htmlFor="email">Email Address</label>
						<input type="email" id="email" name="email" value={userData.email} onChange={handleProfileChange} />
					</div>
					<div className="form-group">
						<label htmlFor="phone">Phone Number</label>
						<input type="tel" id="phone" name="phone" value={userData.phone} onChange={handleProfileChange} />
					</div>
					<div className="form-group">
						<label htmlFor="bio">Bio</label>
						<textarea id="bio" name="bio" rows="4" value={userData.bio} onChange={handleProfileChange} />
					</div>
					<button className="btn btn-primary">Save Changes</button>
				</div>
			)}

			{/* Security Tab */}
			{activeTab === 'security' && (
				<div className="settings-section" id="security-tab">
					<h2 className="section-title"><i className="fas fa-shield-alt"></i> Security Settings</h2>
					<div className="form-group">
						<label>Password</label>
						<p className="device-meta">Last changed 3 months ago</p>
						<button className="btn btn-outline" type="button" onClick={handleShowPasswordForm}>Change Password</button>
					</div>
					{showPasswordForm && (
						<form id="passwordForm">
							<div className="form-group">
								<label htmlFor="currentPassword">Current Password</label>
								<input type="password" id="currentPassword" />
							</div>
							<div className="form-group">
								<label htmlFor="newPassword">New Password</label>
								<input type="password" id="newPassword" />
							</div>
							<div className="form-group">
								<label htmlFor="confirmPassword">Confirm New Password</label>
								<input type="password" id="confirmPassword" />
							</div>
							<div className="form-group">
								<button className="btn btn-primary">Update Password</button>
								<button className="btn btn-outline" onClick={handleCancelPasswordForm}>Cancel</button>
							</div>
						</form>
					)}
					<div className="form-group">
						<label>Two-Factor Authentication</label>
						<p className="device-meta">Add an extra layer of security to your account</p>
						<div className="checkbox-group">
							<input type="checkbox" id="enable2FA" />
							<label htmlFor="enable2FA">Enable Two-Factor Authentication</label>
						</div>
					</div>
					<h3 className="section-title"><i className="fas fa-laptop"></i> Active Devices</h3>
					<div className="security-device current-device">
						<div className="device-info">
							<div className="device-icon"><i className="fas fa-laptop"></i></div>
							<div>
								<h4>MacBook Pro</h4>
								<p className="device-meta">Safari • Nairobi, Kenya (Current)</p>
								<p className="device-meta">Last active: Just now</p>
							</div>
						</div>
						<button className="btn btn-outline btn-sm">Log Out</button>
					</div>
					<div className="security-device">
						<div className="device-info">
							<div className="device-icon"><i className="fas fa-mobile-alt"></i></div>
							<div>
								<h4>iPhone 12</h4>
								<p className="device-meta">Chrome • Nairobi, Kenya</p>
								<p className="device-meta">Last active: 2 days ago</p>
							</div>
						</div>
						<button className="btn btn-outline btn-sm">Log Out</button>
					</div>
					<button className="btn btn-danger"><i className="fas fa-sign-out-alt"></i> Log Out of All Devices</button>
				</div>
			)}

			{/* Notifications Tab */}
			{activeTab === 'notifications' && (
				<div className="settings-section" id="notifications-tab">
					<h2 className="section-title"><i className="fas fa-bell"></i> Notification Preferences</h2>
					<div className="form-group">
						<label>Email Notifications</label>
						<div className="checkbox-group">
							<input type="checkbox" id="courseUpdates" checked={userData.notifications.email.courseUpdates} onChange={handleNotificationChange} />
							<label htmlFor="courseUpdates">Course updates and announcements</label>
						</div>
						<div className="checkbox-group">
							<input type="checkbox" id="promotional" checked={userData.notifications.email.promotional} onChange={handleNotificationChange} />
							<label htmlFor="promotional">Promotional offers and newsletters</label>
						</div>
						<div className="checkbox-group">
							<input type="checkbox" id="accountActivity" checked={userData.notifications.email.accountActivity} onChange={handleNotificationChange} />
							<label htmlFor="accountActivity">Account activity and security</label>
						</div>
					</div>
					<div className="form-group">
						<label>Push Notifications</label>
						<div className="checkbox-group">
							<input type="checkbox" id="newCourses" checked={userData.notifications.push.newCourses} onChange={handleNotificationChange} />
							<label htmlFor="newCourses">New courses and learning opportunities</label>
						</div>
						<div className="checkbox-group">
							<input type="checkbox" id="deadlineReminders" checked={userData.notifications.push.deadlineReminders} onChange={handleNotificationChange} />
							<label htmlFor="deadlineReminders">Assignment deadline reminders</label>
						</div>
						<div className="checkbox-group">
							<input type="checkbox" id="pointsEarned" checked={userData.notifications.push.pointsEarned} onChange={handleNotificationChange} />
							<label htmlFor="pointsEarned">Points earned and rewards</label>
						</div>
					</div>
					<button className="btn btn-primary">Save Preferences</button>
				</div>
			)}

			{/* Privacy Tab */}
			{activeTab === 'privacy' && (
				<div className="settings-section" id="privacy-tab">
					<h2 className="section-title"><i className="fas fa-lock"></i> Privacy Settings</h2>
					<div className="form-group">
						<label>Profile Visibility</label>
						<div className="checkbox-group">
							<input type="radio" id="visibilityPublic" name="visibility" value="public" checked={userData.privacy.visibility === 'public'} onChange={handlePrivacyChange} />
							<label htmlFor="visibilityPublic">Public - Anyone can see my profile and achievements</label>
						</div>
						<div className="checkbox-group">
							<input type="radio" id="visibilityPrivate" name="visibility" value="private" checked={userData.privacy.visibility === 'private'} onChange={handlePrivacyChange} />
							<label htmlFor="visibilityPrivate">Private - Only I can see my profile</label>
						</div>
					</div>
					<div className="form-group">
						<label>Data Sharing</label>
						<div className="checkbox-group">
							<input type="checkbox" id="shareAnalytics" checked={userData.privacy.shareAnalytics} onChange={handlePrivacyChange} />
							<label htmlFor="shareAnalytics">Share anonymous usage data to help improve JHUB Africa</label>
						</div>
						<div className="checkbox-group">
							<input type="checkbox" id="partnerOffers" checked={userData.privacy.partnerOffers} onChange={handlePrivacyChange} />
							<label htmlFor="partnerOffers">Receive offers from our education partners</label>
						</div>
					</div>
					<div className="form-group">
						<label>Data Export</label>
						<p className="device-meta">Request a copy of all your personal data stored by JHUB Africa</p>
						<button className="btn btn-outline"><i className="fas fa-download"></i> Request Data Export</button>
					</div>
					<div className="form-group">
						<label>Account Deletion</label>
						<p className="device-meta">Permanently delete your account and all associated data</p>
						<button className="btn btn-danger"><i className="fas fa-trash"></i> Delete Account</button>
					</div>
				</div>
			)}

			{/* Billing Tab */}
			{activeTab === 'billing' && (
				<div className="settings-section" id="billing-tab">
					<h2 className="section-title"><i className="fas fa-credit-card"></i> Billing Information</h2>
					<div className="form-group">
						<label>Payment Methods</label>
						<div className="security-device">
							<div className="device-info">
								<div className="device-icon"><i className="fab fa-cc-visa"></i></div>
								<div>
									<h4>Visa •••• 4242</h4>
									<p className="device-meta">Expires 04/2025</p>
								</div>
							</div>
							<button className="btn btn-outline btn-sm">Remove</button>
						</div>
						<button className="btn btn-outline"><i className="fas fa-plus"></i> Add Payment Method</button>
					</div>
					<div className="form-group">
						<label>Billing History</label>
						<p className="device-meta">View and download your past invoices</p>
						<button className="btn btn-outline"><i className="fas fa-file-invoice"></i> View Billing History</button>
					</div>
					<div className="form-group">
						<label>Redeem Points</label>
						<p className="device-meta">You have 1,250 points available (KES 1,250)</p>
						<button className="btn btn-primary"><i className="fas fa-coins"></i> Redeem Points</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Settings;
