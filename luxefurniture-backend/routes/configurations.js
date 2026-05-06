// routes/configurations.js
const express = require('express');
const Configuration = require('../models/Configuration');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Save new configuration
router.post('/', protect, async (req, res) => {
  try {
    const { productId, name, options, snapshot } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const calculatedPrice = product.calculatePrice({
      size: options.size?.code,
      material: options.material?.code,
      color: options.color?.code,
      addons: options.addons?.map(a => a.code)
    });
    
    const configuration = await Configuration.create({
      user: req.user._id,
      product: productId,
      name,
      options,
      calculatedPrice,
      snapshot
    });
    
    // Add to user's saved configurations
    await req.user.updateOne({
      $push: { savedConfigurations: configuration._id }
    });
    
    res.status(201).json({
      success: true,
      configuration
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's configurations
router.get('/my-configurations', protect, async (req, res) => {
  try {
    const configurations = await Configuration.find({ user: req.user._id })
      .populate('product', 'name images.basePrice')
      .sort('-createdAt');
    
    res.json({ success: true, configurations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public configurations (gallery)
router.get('/gallery', async (req, res) => {
  try {
    const configurations = await Configuration.find({ isPublic: true })
      .populate('user', 'firstName lastName')
      .populate('product', 'name slug')
      .sort('-likes');
    
    res.json({ success: true, configurations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update configuration
router.put('/:id', protect, async (req, res) => {
  try {
    const configuration = await Configuration.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }
    
    Object.assign(configuration, req.body);
    await configuration.save();
    
    res.json({ success: true, configuration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete configuration
router.delete('/:id', protect, async (req, res) => {
  try {
    await Configuration.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    res.json({ success: true, message: 'Configuration deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like configuration
router.post('/:id/like', protect, async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id);
    
    const alreadyLiked = configuration.likes.includes(req.user._id);
    
    if (alreadyLiked) {
      configuration.likes.pull(req.user._id);
    } else {
      configuration.likes.push(req.user._id);
    }
    
    await configuration.save();
    
    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: configuration.likes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;