const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth'); // ✅ Correct import
const User = require('../models/user');

// @route GET /api/referrals
// @desc  Get referrals made by logged-in user
// @access Private
router.get('/', authenticate, async (req, res) => {  // ✅ Use authenticate function
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referrals = await User.find({ referredBy: currentUser.referralCode });

    res.json({
      code: currentUser.referralCode,
      totalReferrals: referrals.length,
      pointsEarned: currentUser.points,
      referrals: referrals.map(r => ({
        name: r.name,
        email: r.email,
        joinedAt: r.createdAt,
        status: r.points >= 100 ? 'Completed Course' : 'Registered',
        points: r.points >= 100 ? '+100 XP' : 'Pending'
      }))
    });
  } catch (err) {
    console.error('Referral error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;