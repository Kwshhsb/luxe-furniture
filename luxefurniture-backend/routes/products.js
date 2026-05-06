// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sort = '-createdAt',
      page = 1,
      limit = 12,
      featured 
    } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'firstName lastName avatar' }
      });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate price for configuration
router.post('/:id/calculate-price', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const price = product.calculatePrice(req.body);
    
    res.json({
      success: true,
      basePrice: product.basePrice,
      calculatedPrice: price,
      configuration: req.body
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (Admin only)
router.post('/', protect, restrictTo('admin', 'designer'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', protect, restrictTo('admin', 'designer'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;