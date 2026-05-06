// routes/categories.js
const express = require('express');
const Category = require('../models/Category');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort('order');
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get category with products
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    const products = await Product.find({ 
      category: category._id,
      isActive: true 
    }).limit(20);
    
    res.json({
      success: true,
      category,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create category (Admin)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;