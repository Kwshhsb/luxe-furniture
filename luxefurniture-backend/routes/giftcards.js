// routes/giftcards.js - Gift Cards API
const express = require('express');
const GiftCard = require('../models/GiftCard');
const { protect } = require('../../middleware/auth');
const router = express.Router();

// Create gift card
router.post('/', protect, async (req, res) => {
  try {
    const { amount, recipientEmail, recipientName, message, deliveryDate } = req.body;
    
    const code = 'GIFT' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const giftCard = await GiftCard.create({
      code,
      amount,
      purchaser: req.user._id,
      recipientEmail,
      recipientName,
      message,
      deliveryDate: deliveryDate || new Date(),
      status: 'active'
    });
    
    // TODO: Send email to recipient
    
    res.status(201).json({
      success: true,
      giftCard: {
        code: giftCard.code,
        amount: giftCard.amount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Redeem gift card
router.post('/redeem', protect, async (req, res) => {
  try {
    const { code } = req.body;
    
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    
    if (!giftCard || giftCard.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Invalid or expired gift card' });
    }
    
    if (giftCard.balance <= 0) {
      return res.status(400).json({ success: false, message: 'Gift card has no balance' });
    }
    
    // Add to user's wallet
    // TODO: Implement wallet system
    
    giftCard.status = 'redeemed';
    giftCard.redeemedBy = req.user._id;
    giftCard.redeemedAt = new Date();
    await giftCard.save();
    
    res.json({
      success: true,
      amount: giftCard.balance,
      message: `Gift card redeemed! ₹${giftCard.balance} added to your wallet.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;