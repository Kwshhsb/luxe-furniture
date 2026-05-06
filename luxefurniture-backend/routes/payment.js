// routes/payment.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Create payment intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.pricing.total * 100, // Convert to cents/paise
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'completed',
      'payment.transactionId': paymentIntent.id,
      'payment.paidAt': new Date(),
      status: 'confirmed'
    });
  }
  
  res.json({ received: true });
});

module.exports = router;