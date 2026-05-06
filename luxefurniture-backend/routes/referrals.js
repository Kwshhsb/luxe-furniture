// routes/referrals.js - Referral System API
const express = require('express');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { protect } = require('../../middleware/auth');
const router = express.Router();

// Get referral stats
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const referrals = await Referral.find({ referrer: req.user._id });
    
    const successful = referrals.filter(r => r.status === 'completed').length;
    const pending = referrals.filter(r => r.status === 'pending').length;
    const totalEarned = successful * 500; // ₹500 per referral
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      totalEarned,
      successful,
      pending,
      history: referrals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply referral code
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;
    
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer) {
      return res.status(400).json({ success: false, message: 'Invalid referral code' });
    }
    
    if (referrer._id.toString() === req.user._id.toString()) {
      return res.status(400). json({ success: false, message: 'Cannot use your own code' });
    }
    
    // Check if already referred
    const existing = await Referral.findOne({
      referrer: referrer._id,
      referee: req.user._id
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Referral already applied' });
    }
    
    // Create referral record
    await Referral.create({
      referrer: referrer._id,
      referee: req.user._id,
      code: code.toUpperCase(),
      status: 'pending'
    });
    
    res.json({
      success: true,
      message: 'Referral code applied! You get ₹500 off your first order.',
      discount: 500
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;