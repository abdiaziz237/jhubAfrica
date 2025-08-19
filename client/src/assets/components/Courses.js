
import React, { useState, useEffect } from 'react';
import './Courses.css';

const initialCourses = [
	{
		id: 1,
		image: 'images/ic3.jpg',
		category: 'Digital Literacy',
		title: 'IC3 Digital Literacy Certification',
		description: 'Master essential digital skills with this comprehensive eCourse and earn your certification.',
		xp: 250,
		points: 50,
		full: false,
	},
	{
		id: 2,
		image: 'images/communication.jpg',
		category: 'Business',
		title: 'Communication Skills for Business',
		description: 'Develop professional communication skills essential for business success.',
		xp: 200,
		points: 100,
		full: false,
	},
	{
		id: 3,
		image: 'images/networking.jpg',
		category: 'Networking',
		title: 'Cisco CCST Networking',
		description: 'Kickstart your career with Cisco Certified Support Technician certification.',
		xp: 350,
		points: 150,
		full: true,
	},
	{
		id: 4,
		image: 'images/app.jpg',
		category: 'Programming',
		title: 'App Development with Swift',
		description: 
				'Build real iOS applications using Apple\'s powerful Swift programming language.',
		xp: 400,
		points: 200,
		full: false,
	},
];

const initialTransactions = [
	{ description: "Completed 'Digital Literacy' course", amount: 250, isAddition: true },
	{ description: 'Daily login bonus', amount: 50, isAddition: true },
	{ description: '3-day streak bonus', amount: 100, isAddition: true },
];

const initialLeaderboard = [
	{ rank: 1, name: 'silvia M.', xp: 3450, courses: 8, crown: true },
	{ rank: 2, name: 'Sarah K.', xp: 2980, courses: 7 },
	{ rank: 3, name: 'Abdull T.', xp: 2750, courses: 6 },
];

function Courses() {
	// State
	const [userPoints, setUserPoints] = useState(1250);
	const [completedCourses, setCompletedCourses] = useState(3);
	const [waitlistedCourses, setWaitlistedCourses] = useState([]);
	const [transactions, setTransactions] = useState(initialTransactions);
	const [showModal, setShowModal] = useState({ progress: false, waitlist: false, customRedeem: false });
	const [modalCourseId, setModalCourseId] = useState(null);
	const [earnedPoints, setEarnedPoints] = useState(0);
	const [customRedeemAmount, setCustomRedeemAmount] = useState('');
	const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
	const [userLevel, setUserLevel] = useState(1);
	const [levelProgress, setLevelProgress] = useState(0);
	const [achievements, setAchievements] = useState({ master: userPoints >= 2000, collector: completedCourses >= 5 });

	const pointsPerLevel = 2000;

	useEffect(() => {
		// Update level and progress
		const level = Math.floor(userPoints / pointsPerLevel) + 1;
		setUserLevel(level);
		setLevelProgress(((userPoints % pointsPerLevel) / pointsPerLevel) * 100);
		setAchievements({
			master: userPoints >= 2000,
			collector: completedCourses >= 5,
		});
	}, [userPoints, completedCourses]);

	// Handlers
	const handleEnroll = (course) => {
		// Simulate auth check
		const isLoggedIn = true; // Replace with real auth check
		if (!isLoggedIn) {
			window.location.href = '/login?redirect=courses';
			return;
		}
		if (course.full) {
			setModalCourseId(course.id);
			setShowModal((m) => ({ ...m, waitlist: true }));
		} else {
			setEarnedPoints(course.points);
			setModalCourseId(course.id);
			setShowModal((m) => ({ ...m, progress: true }));
		}
	};

	const handleProceedEnrollment = () => {
		// Add points and transaction
		setUserPoints((p) => p + earnedPoints);
		setCompletedCourses((c) => c + 1);
		setTransactions((t) => [
			{ description: `Completed course ${modalCourseId}`, amount: earnedPoints, isAddition: true },
			...t,
		]);
		setShowModal((m) => ({ ...m, progress: false }));
	};

	const handleJoinWaitlist = () => {
		setWaitlistedCourses((w) => [...w, modalCourseId]);
		setShowModal((m) => ({ ...m, waitlist: false }));
		alert(`You've been added to the waitlist for course ${modalCourseId}. We'll notify you when a spot becomes available.`);
	};

	const handleRedeem = (amount) => {
		if (amount > userPoints) {
			alert("You don't have enough points for this redemption");
			return;
		}
		if (window.confirm(`Redeem ${amount.toLocaleString()} points for KES ${amount.toLocaleString()}?`)) {
			setUserPoints((p) => p - amount);
			setTransactions((t) => [
				{ description: 'Points redeemed for KES', amount, isAddition: false },
				...t,
			]);
			alert(`Success! KES ${amount.toLocaleString()} will be sent to your M-Pesa shortly.`);
		}
	};

	const handleCustomRedeem = () => {
		const amount = parseInt(customRedeemAmount);
		if (isNaN(amount)) {
			alert('Please enter a valid amount');
			return;
		}
		if (amount < 100) {
			alert('Minimum redemption is 100 points');
			return;
		}
		handleRedeem(amount);
		setShowModal((m) => ({ ...m, customRedeem: false }));
		setCustomRedeemAmount('');
	};

	// Render
	return (
		<div>
			{/* Gamification Header */}
			<header className="profile-header">
				<div className="profile-info">
					<div className="avatar">JS</div>
					<div>
						<h3>Jane Student</h3>
						<p id="userLevel">Level {userLevel} Explorer</p>
					</div>
				</div>
				<div className="xp-bar">
					<div className="xp-progress" style={{ width: `${levelProgress}%` }}></div>
				</div>
				<span id="levelProgressText">{Math.round(levelProgress)}% to next level</span>
				<div className="points-display">
					<i className="fas fa-coins"></i> <span id="headerPoints">{userPoints.toLocaleString()}</span> XP
				</div>
				<div className="badges-container">
					<div className="badge" title="First Course Completed"><i className="fas fa-award"></i></div>
					<div className="badge" title="Week Streak"><i className="fas fa-fire"></i></div>
				</div>
			</header>

			{/* Main Content */}
			<div className="container">
				<div className="page-title">
					<h1>JHUB Africa Courses</h1>
					<p>Grow your skills, earn XP, and unlock achievements!</p>
				</div>

				{/* Courses Grid */}
				<div className="courses-grid">
					{initialCourses.map((course) => (
						<div className="course-card" key={course.id}>
							<img src={course.image} alt={course.title} className="course-image" />
							<div className="course-content">
								<span className="course-category">{course.category}</span>
								<h3 className="course-title">{course.title}</h3>
								<p className="course-description">{course.description}</p>
								<div className="course-meta">
									<span className="course-xp"><i className="fas fa-bolt"></i> {course.xp} XP</span>
									<button className="enroll-button" onClick={() => handleEnroll(course)}>
										{waitlistedCourses.includes(course.id) ? 'Waitlisted' : 'Enroll Now'}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Achievements Section */}
				<div className="achievements-section">
					<h2 className="section-title"><i className="fas fa-trophy"></i> Your Achievements</h2>
					<div className="achievements-grid">
						<div className="achievement-card">
							<div className="achievement-icon"><i className="fas fa-book-open"></i></div>
							<h4 className="achievement-title">Fast Learner</h4>
							<p className="achievement-desc">Completed your first course</p>
						</div>
						<div className="achievement-card">
							<div className="achievement-icon"><i className="fas fa-fire"></i></div>
							<h4 className="achievement-title">3-Day Streak</h4>
							<p className="achievement-desc">Logged in 3 days in a row</p>
						</div>
						<div className={`achievement-card${achievements.collector ? '' : ' locked'}`} id="collectorAchievement">
							<div className="achievement-icon"><i className="fas fa-star"></i></div>
							<h4 className="achievement-title">Course Collector</h4>
							<p className="achievement-desc">Complete 5 courses</p>
						</div>
						<div className={`achievement-card${achievements.master ? '' : ' locked'}`} id="masterAchievement">
							<div className="achievement-icon"><i className="fas fa-graduation-cap"></i></div>
							<h4 className="achievement-title">Master Student</h4>
							<p className="achievement-desc">Earn 2000 XP points</p>
						</div>
					</div>
				</div>

				{/* Leaderboard Section */}
				<div className="leaderboard-section">
					<h2 className="section-title"><i className="fas fa-chart-line"></i> Leaderboard</h2>
					<table className="leaderboard-table">
						<thead>
							<tr>
								<th>Rank</th>
								<th>Student</th>
								<th>XP</th>
								<th>Courses</th>
							</tr>
						</thead>
						<tbody>
							{leaderboard.map((entry) => (
								<tr key={entry.rank}>
									<td className="rank">{entry.rank}</td>
									<td>{entry.crown ? <i className="fas fa-crown" style={{ color: 'gold' }}></i> : null} {entry.name}</td>
									<td>{entry.xp.toLocaleString()}</td>
									<td>{entry.courses}</td>
								</tr>
							))}
							<tr>
								<td className="rank">7</td>
								<td>You</td>
								<td id="leaderboardPoints">{userPoints.toLocaleString()}</td>
								<td id="userCourses">{completedCourses}</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* Points System Section */}
				<div className="points-system">
					<h2 className="section-title"><i className="fas fa-coins"></i> Your Points Wallet</h2>
					<div className="points-balance">
						Available Points: <span className="points-value" id="totalPoints">{userPoints.toLocaleString()}</span>
						<div className="kes-conversion">≈ KES <span id="kesValue">{userPoints.toLocaleString()}</span> (1 point = 1 KES)</div>
					</div>

					<div className="redeem-section">
						<h3>Redeem Points for M-Pesa</h3>
						<p>Convert your learning points to real money in your M-Pesa account</p>
						<div className="redeem-options">
							{[100, 500, 1000].map((amt) => (
								<div className="redeem-option" key={amt} onClick={() => handleRedeem(amt)}>
									<div className="redeem-amount">{amt.toLocaleString()} Points</div>
									<div className="redeem-rate">KES {amt.toLocaleString()}</div>
								</div>
							))}
							<div className="redeem-option" onClick={() => setShowModal((m) => ({ ...m, customRedeem: true }))}>
								<div className="redeem-amount">Custom Amount</div>
								<div className="redeem-rate">Any amount ≥100</div>
							</div>
						</div>
					</div>

					<div className="transaction-history">
						<h3>Points History</h3>
						<div id="transactionsList">
							{transactions.map((tx, idx) => (
								<div className="transaction-item" key={idx}>
									<div>{tx.description}</div>
									<div className={tx.isAddition ? 'transaction-positive' : 'transaction-negative'}>
										{tx.isAddition ? '+' : '-'}{tx.amount.toLocaleString()} points
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Custom Redemption Modal */}
			{showModal.customRedeem && (
				<div className="modal" style={{ display: 'flex' }}>
					<div className="modal-content">
						<span className="close-modal" onClick={() => { setShowModal((m) => ({ ...m, customRedeem: false })); setCustomRedeemAmount(''); }}>&times;</span>
						<h2>Custom Points Redemption</h2>
						<p>Enter amount to redeem (minimum 100 points)</p>
						<input
							type="number"
							min="100"
							step="10"
							placeholder="Points amount"
							style={{ width: '100%', padding: '10px', margin: '15px 0', border: '1px solid #ddd', borderRadius: '5px' }}
							value={customRedeemAmount}
							onChange={e => setCustomRedeemAmount(e.target.value)}
						/>
						<p>You'll receive: <strong>KES <span id="customRedeemKES">{parseInt(customRedeemAmount) || 0}</span></strong></p>
						<button className="enroll-button" style={{ width: '100%', padding: '12px', marginTop: '10px' }} onClick={handleCustomRedeem}>
							Redeem to M-Pesa
						</button>
					</div>
				</div>
			)}

			{/* Progress Modal */}
			{showModal.progress && (
				<div className="modal" style={{ display: 'flex' }}>
					<div className="modal-content">
						<span className="close-modal" onClick={() => setShowModal((m) => ({ ...m, progress: false }))}>&times;</span>
						<h2>Course Enrollment Successful!</h2>
						<p>You've earned <strong id="earnedPoints">{earnedPoints}</strong> XP for enrolling in this course.</p>
						<div className="progress-animation">
							<div className="progress-circle" style={{ background: 'conic-gradient(var(--accent-color) 100%, #e0e0e0 0%)' }}>
								<div className="progress-text" id="progressPoints">+{earnedPoints}</div>
							</div>
						</div>
						<p>Keep learning to unlock achievements and climb the leaderboard!</p>
						<button className="enroll-button" onClick={handleProceedEnrollment}>Continue Learning</button>
					</div>
				</div>
			)}

			{/* Waitlist Modal */}
			{showModal.waitlist && (
				<div className="modal" style={{ display: 'flex' }}>
					<div className="modal-content">
						<span className="close-modal" onClick={() => setShowModal((m) => ({ ...m, waitlist: false }))}>&times;</span>
						<h2>Join Waitlist</h2>
						<p>The course is currently full. Would you like to join the waitlist?</p>
						<p>We'll notify you when a spot becomes available.</p>
						<div className="modal-buttons">
							<button className="enroll-button" onClick={handleJoinWaitlist}>Join Waitlist</button>
							<button className="cancel-button" onClick={() => setShowModal((m) => ({ ...m, waitlist: false }))}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Courses;
