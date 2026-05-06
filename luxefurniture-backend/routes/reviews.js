// routes/reviews.js
const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'firstName lastName avatar')
      .sort('-createdAt');
    
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(req.params.productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      reviews,
      stats: stats[0] || { averageRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create review
router.post('/', protect, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;
    
    // Verify user purchased the product
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      'items.product': productId,
      status: 'delivered'
    });
    
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: !!order
    });
    
    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(avgRating * 10) / 10,
      'ratings.count': reviews.length,
      $push: { reviews: review._id }
    });
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;