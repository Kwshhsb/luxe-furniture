// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  configuration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Configuration'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  price: { // Price at time of adding to cart
    type: Number,
    required: true
  },
  customOptions: {
    size: String,
    color: String,
    material: String,
    legs: String,
    addons: [String]
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    type: { type: String, enum: ['percentage', 'fixed'] }
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals
cartSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let itemCount = 0;
  
  this.items.forEach(item => {
    subtotal += item.price * item.quantity;
    itemCount += item.quantity;
  });
  
  let discount = 0;
  if (this.coupon) {
    if (this.coupon.type === 'percentage') {
      discount = subtotal * (this.coupon.discount / 100);
    } else {
      discount = this.coupon.discount;
    }
  }
  
  const tax = (subtotal - discount) * 0.18; // 18% GST for India
  const shipping = subtotal > 50000 ? 0 : 1500; // Free shipping above 50k
  
  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    tax: Math.round(tax),
    shipping,
    total: Math.round(subtotal - discount + tax + shipping),
    itemCount
  };
};

module.exports = mongoose.model('Cart', cartSchema);