import React, { useEffect, useState } from "react";
import "./Referrals.css";

const Referrals = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  // Load referral data from backend
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch user info (with referral code)
    fetch("http://localhost:5001/api/v1/auth/me", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      });

    // Fetch referral stats
    fetch("http://localhost:5000/api/referrals/stats", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load referral stats", err));
  }, []);

  const copyReferralLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="referrals-page">
      {/* Hero */}
      <div className="referral-hero">
        <h1>Refer Friends & Earn Points</h1>
        <p>
          Get <strong>100 XP</strong> for every friend who joins JHUB Africa
          using your referral link. They'll get <strong>50 XP</strong> too!
        </p>
      </div>

      {/* Referral card */}
      <div className="referral-card">
        <h2>Your Referral Code</h2>
        <div className="referral-code">
          {user?.referralCode || "Loading..."}
        </div>

        <h2>Your Unique Referral Link</h2>
        <div className="referral-link">
          <input
            type="text"
            value={
              user
                ? `${window.location.origin}/register?ref=${user.referralCode}`
                : ""
            }
            readOnly
          />
          <button onClick={copyReferralLink}>
            <i className="fas fa-copy"></i> Copy
          </button>
        </div>

        <p>Share your link with friends via:</p>
        <div className="share-buttons">
          <div
            className="share-button facebook"
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.origin +
                    "/register?ref=" +
                    (user?.referralCode || "")
                )}`,
                "_blank"
              )
            }
          >
            <i className="fab fa-facebook-f"></i>
          </div>
          <div
            className="share-button twitter"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Join JHUB Africa using my referral link and we both earn XP points!"
                )}&url=${encodeURIComponent(
                  window.location.origin +
                    "/register?ref=" +
                    (user?.referralCode || "")
                )}`,
                "_blank"
              )
            }
          >
            <i className="fab fa-twitter"></i>
          </div>
          <div
            className="share-button whatsapp"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  "Join JHUB Africa using my referral link: " +
                    window.location.origin +
                    "/register?ref=" +
                    (user?.referralCode || "")
                )}`,
                "_blank"
              )
            }
          >
            <i className="fab fa-whatsapp"></i>
          </div>
          <div
            className="share-button email"
            onClick={() =>
              (window.location.href = `mailto:?subject=Join JHUB Africa&body=Sign up with my referral link: ${
                window.location.origin
              }/register?ref=${user?.referralCode || ""}`)
            }
          >
            <i className="fas fa-envelope"></i>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="referral-stats">
        <div className="stat-card">
          <h3>{stats?.totalReferrals || 0}</h3>
          <p>Friends Referred</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.pointsEarned || 0} XP</h3>
          <p>Points Earned</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.pendingPoints || 0} XP</h3>
          <p>Pending Points</p>
        </div>
        <div className="stat-card">
          <h3>KES {stats?.potentialEarnings || 0}</h3>
          <p>Potential Earnings</p>
        </div>
      </div>

      {/* Referral history */}
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
          {stats?.referrals?.length > 0 ? (
            stats.referrals.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.date}</td>
                <td
                  className={
                    r.status === "Completed Course"
                      ? "status-completed"
                      : "status-pending"
                  }
                >
                  {r.status}
                </td>
                <td>{r.points}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No referrals yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Referrals;
