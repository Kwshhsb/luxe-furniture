// routes/cart.js
const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.configuration');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    const totals = cart.calculateTotals();
    
    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        totals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, configurationId, quantity, customOptions } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Calculate price based on custom options
    const price = product.calculatePrice({
      size: customOptions?.size,
      material: customOptions?.material,
      color: customOptions?.color,
      addons: customOptions?.addons
    });
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      JSON.stringify(item.customOptions) === JSON.stringify(customOptions)
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        configuration: configurationId,
        quantity: quantity || 1,
        price,
        customOptions
      });
    }
    
    cart.lastModified = Date.now();
    await cart.save();
    
    const totals = cart.calculateTotals();
    
    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        totals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quantity
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.quantity = quantity;
    cart.lastModified = Date.now();
    await cart.save();
    
    const totals = cart.calculateTotals();
    
    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        totals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from cart
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    cart.lastModified = Date.now();
    await cart.save();
    
    const totals = cart.calculateTotals();
    
    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        totals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.coupon = null;
      await cart.save();
    }
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply coupon
router.post('/coupon', protect, async (req, res) => {
  try {
    const { code } = req.body;
    
    // Simple coupon validation (expand as needed)
    const coupons = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE500': { discount: 500, type: 'fixed' },
      'DIWALI20': { discount: 20, type: 'percentage' }
    };
    
    const coupon = coupons[code.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.coupon = {
      code: code.toUpperCase(),
      ...coupon
    };
    await cart.save();
    
    const totals = cart.calculateTotals();
    
    res.json({
      success: true,
      message: 'Coupon applied',
      cart: {
        ...cart.toObject(),
        totals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;