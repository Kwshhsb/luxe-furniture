// routes/orders.js
const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Create order from cart
router.post('/create', protect, async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    
    const totals = cart.calculateTotals();
    
    // Create order items from cart items
    const orderItems = await Promise.all(cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      return {
        product: item.product,
        configuration: item.configuration,
        quantity: item.quantity,
        price: item.price,
        customOptions: item.customOptions
      };
    }));
    
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      },
      pricing: totals,
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
    });
    
    // Clear cart after order creation
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images.thumbnail')
      .sort('-createdAt');
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all orders
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update order status
router.put('/:id/status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, tracking } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.status = status;
    if (tracking) {
      order.tracking = { ...order.tracking, ...tracking };
    }
    
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;