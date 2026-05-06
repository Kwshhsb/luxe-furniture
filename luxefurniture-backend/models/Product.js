// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: String,
    enum: ['sofa', 'chair', 'table', 'bed', 'storage', 'lighting', 'decor']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  configurations: {
    sizes: [{
      name: { type: String, required: true },
      code: { type: String, required: true },
      width: Number,
      depth: Number,
      height: Number,
      priceModifier: { type: Number, default: 0 },
      dimensions: {
        metric: String,
        imperial: String
      }
    }],
    colors: [{
      name: { type: String, required: true },
      code: { type: String, required: true },
      hex: { type: String, required: true },
      priceModifier: { type: Number, default: 0 },
      image: String
    }],
    materials: [{
      name: { type: String, required: true },
      code: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['velvet', 'linen', 'leather', 'boucle', 'cotton', 'silk']
      },
      priceModifier: { type: Number, default: 0 },
      description: String,
      careInstructions: [String]
    }],
    legs: [{
      name: String,
      code: String,
      material: String,
      finish: String,
      priceModifier: { type: Number, default: 0 }
    }],
    addons: [{
      name: String,
      code: String,
      price: Number,
      description: String
    }]
  },
  images: {
    thumbnail: String,
    gallery: [String],
    model3d: {   // ✅ FIXED
      url: String,
      format: { type: String, enum: ['gltf', 'glb', 'obj', 'fbx'] },
      textures: [String]
    }
  },
  inventory: {
    sku: { type: String, unique: true },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'],
      default: 'in_stock'
    },
    quantity: { type: Number, default: 0 },
    leadTime: { type: Number, default: 2 }
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  weight: Number,
  assemblyRequired: { type: Boolean, default: false },
  warranty: {
    duration: Number,
    description: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Price Calculation Method
productSchema.methods.calculatePrice = function(config) {
  let price = this.basePrice;
  
  if (config.size) {
    const size = this.configurations.sizes.find(s => s.code === config.size);
    if (size) price += size.priceModifier;
  }
  
  if (config.material) {
    const material = this.configurations.materials.find(m => m.code === config.material);
    if (material) price += material.priceModifier;
  }
  
  if (config.color) {
    const color = this.configurations.colors.find(c => c.code === config.color);
    if (color) price += color.priceModifier;
  }
  
  if (config.addons) {
    config.addons.forEach(addonCode => {
      const addon = this.configurations.addons.find(a => a.code === addonCode);
      if (addon) price += addon.price;
    });
  }
  
  return price;
};

// Search Index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     trim: true,
//     maxlength: [100, 'Name cannot exceed 100 characters']
//   },
//   slug: {
//     type: String,
//     unique: true,
//     lowercase: true
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     maxlength: [2000, 'Description cannot exceed 2000 characters']
//   },
//   shortDescription: {
//     type: String,
//     maxlength: [200, 'Short description cannot exceed 200 characters']
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true
//   },
//   subCategory: {
//     type: String,
//     enum: ['sofa', 'chair', 'table', 'bed', 'storage', 'lighting', 'decor']
//   },
//   basePrice: {
//     type: Number,
//     required: [true, 'Base price is required'],
//     min: 0
//   },
//   configurations: {
//     sizes: [{
//       name: { type: String, required: true },
//       code: { type: String, required: true },
//       width: Number,
//       depth: Number,
//       height: Number,
//       priceModifier: { type: Number, default: 0 },
//       dimensions: {
//         metric: String,
//         imperial: String
//       }
//     }],
//     colors: [{
//       name: { type: String, required: true },
//       code: { type: String, required: true },
//       hex: { type: String, required: true },
//       priceModifier: { type: Number, default: 0 },
//       image: String
//     }],
//     materials: [{
//       name: { type: String, required: true },
//       code: { type: String, required: true },
//       type: { 
//         type: String, 
//         enum: ['velvet', 'linen', 'leather', 'boucle', 'cotton', 'silk']
//       },
//       priceModifier: { type: Number, default: 0 },
//       description: String,
//       careInstructions: [String]
//     }],
//     legs: [{
//       name: String,
//       code: String,
//       material: String,
//       finish: String,
//       priceModifier: { type: Number, default: 0 }
//     }],
//     addons: [{
//       name: String,
//       code: String,
//       price: Number,
//       description: String
//     }]
//   },
//   images: {
//     thumbnail: String,
//     gallery: [String],
//     3dModel: {
//       url: String,
//       format: { type: String, enum: ['gltf', 'glb', 'obj', 'fbx'] },
//       textures: [String]
//     }
//   },
//   inventory: {
//     sku: { type: String, unique: true },
//     stockStatus: {
//       type: String,
//       enum: ['in_stock', 'low_stock', 'out_of_stock', 'pre_order'],
//       default: 'in_stock'
//     },
//     quantity: { type: Number, default: 0 },
//     leadTime: { type: Number, default: 2 } // weeks
//   },
//   ratings: {
//     average: { type: Number, default: 0, min: 0, max: 5 },
//     count: { type: Number, default: 0 }
//   },
//   reviews: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Review'
//   }],
//   tags: [String],
//   isActive: { type: Boolean, default: true },
//   isFeatured: { type: Boolean, default: false },
//   weight: Number, // kg
//   assemblyRequired: { type: Boolean, default: false },
//   warranty: {
//     duration: Number, // months
//     description: String
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Virtual for calculating price based on configuration
// productSchema.methods.calculatePrice = function(config) {
//   let price = this.basePrice;
  
//   if (config.size) {
//     const size = this.configurations.sizes.find(s => s.code === config.size);
//     if (size) price += size.priceModifier;
//   }
  
//   if (config.material) {
//     const material = this.configurations.materials.find(m => m.code === config.material);
//     if (material) price += material.priceModifier;
//   }
  
//   if (config.color) {
//     const color = this.configurations.colors.find(c => c.code === config.color);
//     if (color) price += color.priceModifier;
//   }
  
//   if (config.addons) {
//     config.addons.forEach(addonCode => {
//       const addon = this.configurations.addons.find(a => a.code === addonCode);
//       if (addon) price += addon.price;
//     });
//   }
  
//   return price;
// };

// // Index for search
// productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// module.exports = mongoose.model('Product', productSchema);