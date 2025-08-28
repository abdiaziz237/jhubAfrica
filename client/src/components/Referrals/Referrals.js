import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Referrals.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pointsEarned: 0,
    bonusXP: 0,
    pendingReferrals: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
    const token = localStorage.getItem("authToken");
        
    if (!token) {
          navigate("/login");
      return;
    }

        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
          
          // Set referral stats based on user data
          const totalRefs = userData.user.referrals || 0;
          setReferralStats({
            totalReferrals: totalRefs,
            pointsEarned: totalRefs * 100,
            bonusXP: totalRefs * 50,
            pendingReferrals: 0 // Will be calculated from real data
          });
        } else {
          throw new Error("Invalid user data");
        }

        // Fetch real referrals from database
        try {
          const referralsRes = await fetch(`${API_BASE_URL}/api/v1/referrals`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (referralsRes.ok) {
            const referralsData = await referralsRes.json();
            if (referralsData.success && referralsData.data) {
              setReferrals(referralsData.data);
              
              // Update stats with real data
              const completedRefs = referralsData.data.filter(ref => ref.status === 'completed').length;
              const pendingRefs = referralsData.data.filter(ref => ref.status === 'pending').length;
              
              setReferralStats(prev => ({
                ...prev,
                pendingReferrals: pendingRefs,
                completedReferrals: completedRefs
              }));
            } else {
              setReferrals([]);
            }
          } else {
            setReferrals([]);
          }
        } catch (err) {
          console.error('Error fetching referrals:', err);
          setReferrals([]);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || 'JHUB1234'}`;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || 'JHUB1234'}`;
    const shareText = `Join me on JHUB Africa and start your learning journey! Use my referral code: ${user?.referralCode || 'JHUB1234'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join JHUB Africa',
        text: shareText,
        url: referralLink
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      copyReferralLink();
    }
  };

  if (loading) {
  return (
      <div className="referrals-loading">
        <div className="loading-spinner"></div>
        <p>Loading your referrals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="referrals-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="referrals-error">
        <h2>No user data found</h2>
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="referrals">
      {/* Header */}
      <header className="referrals-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Referral Program</h1>
            <p className="subtitle">Invite friends and earn rewards together</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
          </button>
          </div>
        </div>
      </header>

      {/* Referrals Content */}
      <div className="referrals-container">
        <div className="referrals-grid">
          {/* Referral Stats */}
          <div className="stats-card">
            <h3>Your Referral Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon primary">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">{referralStats.totalReferrals}</span>
                  <span className="stat-label">Total Referrals</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon success">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">{referralStats.pointsEarned}</span>
                  <span className="stat-label">Points Earned</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon info">
                  <i className="fas fa-rocket"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">{referralStats.bonusXP}</span>
                  <span className="stat-label">Bonus XP</span>
                </div>
        </div>

              <div className="stat-item">
                <div className="stat-icon warning">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">{referralStats.pendingReferrals}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
          </div>
          </div>

          {/* Referral Code */}
          <div className="referral-code-card">
            <h3>Your Referral Code</h3>
            <div className="code-section">
              <div className="code-display">
                <span className="referral-code">{user.referralCode || "JHUB1234"}</span>
                <button className="btn-copy" onClick={copyReferralLink}>
                  <i className="fas fa-copy"></i>
                </button>
          </div>
              <p className="code-note">
                Share this code with friends to earn bonus points when they join!
              </p>
              <div className="code-actions">
                <button className="btn-primary" onClick={shareReferralLink}>
                  <i className="fas fa-share-alt"></i>
                  Share Referral Link
                </button>
                <button className="btn-secondary" onClick={copyReferralLink}>
                  <i className="fas fa-copy"></i>
                  Copy Link
                </button>
          </div>
        </div>
      </div>

          {/* How It Works */}
          <div className="how-it-works-card">
            <h3>How It Works</h3>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Share Your Link</h4>
                  <p>Send your unique referral link to friends and family</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Friends Join</h4>
                  <p>They sign up using your referral link or code</p>
                </div>
        </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Earn Rewards</h4>
                  <p>Both you and your friend get bonus points and XP</p>
        </div>
        </div>
        </div>
      </div>

          {/* Referrals List */}
          <div className="referrals-list-card">
            <h3>Your Referrals</h3>
            {referrals.length > 0 ? (
              <div className="referrals-list">
                {referrals.map((referral) => (
                  <div key={referral.id} className="referral-item">
                    <div className="referral-info">
                      <div className="referral-avatar">
                        <span className="avatar-text">
                          {referral.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="referral-details">
                        <h4>{referral.name}</h4>
                        <p>{referral.email}</p>
                        <span className="referral-date">
                          Joined: {new Date(referral.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="referral-status">
                      <span className={`status-badge ${referral.status}`}>
                        {referral.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                      <div className="referral-rewards">
                        <span className="points-earned">+{referral.pointsEarned} pts</span>
                        <span className="bonus-xp">+{referral.bonusXP} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-users"></i>
                <h4>No referrals yet</h4>
                <p>Start sharing your referral link to earn rewards!</p>
                <button className="btn-primary" onClick={shareReferralLink}>
                  <i className="fas fa-share-alt"></i>
                  Share Now
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="actions-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate("/profile")}>
                <i className="fas fa-user"></i>
                View Profile
              </button>
              <button className="btn-secondary" onClick={() => navigate("/settings")}>
                <i className="fas fa-cog"></i>
                Account Settings
              </button>
              <button className="btn-secondary" onClick={() => navigate("/courses")}>
                <i className="fas fa-book"></i>
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
