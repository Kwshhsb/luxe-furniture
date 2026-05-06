// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    configuration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Configuration'
    },
    quantity: Number,
    price: Number, // Price at time of order
    customOptions: {
      size: String,
      color: String,
      material: String
    }
  }],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  billingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'cod', 'emi'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  pricing: {
    subtotal: Number,
    discount: Number,
    tax: Number,
    shipping: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    url: String,
    updates: [{
      status: String,
      location: String,
      timestamp: Date
    }]
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  notes: String
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'LF';
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `${prefix}${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);