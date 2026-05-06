// models/Configuration.js - 3D Configurations saved by users
const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    default: 'My Custom Design'
  },
  options: {
    size: {
      code: String,
      name: String
    },
    color: {
      code: String,
      name: String,
      hex: String
    },
    material: {
      code: String,
      name: String,
      type: String
    },
    legs: {
      code: String,
      name: String
    },
    addons: [{
      code: String,
      name: String
    }]
  },
  calculatedPrice: {
    type: Number,
    required: true
  },
  snapshot: {
    thumbnail: String, // Base64 or URL of 3D render
    cameraPosition: {
      x: Number,
      y: Number,
      z: Number
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Configuration', configurationSchema);