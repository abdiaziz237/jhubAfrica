import React, { useEffect, useState, useRef } from "react";
import "./Referrals.css";

const mockReferralData = {
	code: "JANE1234",
	totalReferrals: 5,
	pointsEarned: 500,
	pendingPoints: 250,
	potentialEarnings: 750,
	referrals: [
		{ name: "Sarah K.", date: "15 Mar 2023", status: "Completed Course", points: "+100 XP" },
		{ name: "Michael T.", date: "22 Mar 2023", status: "Completed Course", points: "+100 XP" },
		{ name: "David M.", date: "5 Apr 2023", status: "Completed Course", points: "+100 XP" },
		{ name: "Grace W.", date: "18 Apr 2023", status: "Completed Course", points: "+100 XP" },
		{ name: "Robert N.", date: "2 May 2023", status: "Completed Course", points: "+100 XP" },
		{ name: "Lisa P.", date: "10 May 2023", status: "Registered", points: "Pending" },
		{ name: "James K.", date: "15 May 2023", status: "Registered", points: "Pending" },
	],
};

const Referrals = () => {
	const [referralData, setReferralData] = useState(mockReferralData);
	const [referralCode, setReferralCode] = useState("");
	const [referralLink, setReferralLink] = useState("");
	const referralLinkRef = useRef(null);

	useEffect(() => {
		// Simulate fetching user data (replace with real API call)
		setReferralCode(referralData.code);
		setReferralLink(`https://jhubafrica.com/register?ref=${referralData.code}`);
	}, [referralData]);

	const copyReferralLink = () => {
		if (referralLinkRef.current) {
			referralLinkRef.current.select();
			document.execCommand("copy");
			alert("Referral link copied to clipboard!");
		}
	};

	const shareOnFacebook = () => {
		const link = encodeURIComponent(referralLink);
		window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, "_blank");
	};
	const shareOnTwitter = () => {
		const link = encodeURIComponent(referralLink);
		const text = encodeURIComponent("Join JHUB Africa using my referral link and we both earn XP points!");
		window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, "_blank");
	};
	const shareOnWhatsApp = () => {
		const link = encodeURIComponent(referralLink);
		const text = encodeURIComponent("Hey! Join JHUB Africa using my referral link and we both earn XP points: ");
		window.open(`https://wa.me/?text=${text}${link}`, "_blank");
	};
	const shareViaEmail = () => {
		const subject = encodeURIComponent("Join JHUB Africa with my referral");
		const body = encodeURIComponent(
			`Hi there!\n\nI thought you might be interested in JHUB Africa's gamified learning platform. If you sign up using my referral link, we both earn XP points that can be redeemed for cash!\n\nMy referral link: ${referralLink}\n\nLooking forward to learning together!\n\nBest regards,`
		);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	};

	return (
		<div className="referrals-page">
			<div className="referral-hero">
				<h1>Refer Friends & Earn Points</h1>
				<p>Get 100 XP for every friend who joins JHUB Africa using your referral link. They'll get 50 XP too!</p>
			</div>

			<div className="referral-card">
				<h2>Your Referral Code</h2>
				<div className="referral-code">{referralCode}</div>

				<h2>Your Unique Referral Link</h2>
				<div className="referral-link">
					<input
						type="text"
						ref={referralLinkRef}
						value={referralLink}
						readOnly
					/>
					<button onClick={copyReferralLink}>
						<i className="fas fa-copy"></i> Copy
					</button>
				</div>
				<p>Share your link with friends via:</p>
				<div className="share-buttons">
					<div className="share-button facebook" onClick={shareOnFacebook}>
						<i className="fab fa-facebook-f"></i>
					</div>
					<div className="share-button twitter" onClick={shareOnTwitter}>
						<i className="fab fa-twitter"></i>
					</div>
					<div className="share-button whatsapp" onClick={shareOnWhatsApp}>
						<i className="fab fa-whatsapp"></i>
					</div>
					<div className="share-button email" onClick={shareViaEmail}>
						<i className="fas fa-envelope"></i>
					</div>
				</div>
			</div>

			<div className="referral-stats">
				<div className="stat-card">
					<h3>{referralData.totalReferrals}</h3>
					<p>Friends Referred</p>
				</div>
				<div className="stat-card">
					<h3>{referralData.pointsEarned} XP</h3>
					<p>Points Earned</p>
				</div>
				<div className="stat-card">
					<h3>{referralData.pendingPoints} XP</h3>
					<p>Pending Points</p>
				</div>
				<div className="stat-card">
					<h3>KES {referralData.potentialEarnings}</h3>
					<p>Potential Earnings</p>
				</div>
			</div>

			<h2>Your Referral History</h2>
			<table className="referral-table">
				<thead>
					<tr>
						<th>Friend</th>
						<th>Date Referred</th>
						<th>Status</th>
						<th>Points Earned</th>
					</tr>
				</thead>
				<tbody>
					{referralData.referrals.map((ref, idx) => (
						<tr key={idx}>
							<td>{ref.name}</td>
							<td>{ref.date}</td>
							<td className={ref.status === "Registered" ? "status-pending" : "status-completed"}>{ref.status}</td>
							<td>{ref.points}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Referrals;
