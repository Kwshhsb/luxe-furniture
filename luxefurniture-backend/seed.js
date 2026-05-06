// seed.js - Database Seeding
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/luxefurniture'
    );

    console.log("MongoDB Connected");

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const admin = await User.create({
      email: 'admin@luxefurniture.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    console.log('Admin created:', admin.email);

    // Create categories
    const livingRoom = await Category.create({
      name: 'Living Room',
      slug: 'living-room',
      description: 'Sofas, chairs, and living room essentials'
    });

    const bedroom = await Category.create({
      name: 'Bedroom',
      slug: 'bedroom',
      description: 'Beds, mattresses, and bedroom furniture'
    });

    // Create product
    const cloudSofa = await Product.create({
      name: 'Cloud Modular Sofa',
      slug: 'cloud-modular-sofa',
      description:
        'Experience ultimate comfort with our signature tufted modular sofa.',
      shortDescription: 'Modular comfort redefined',
      category: livingRoom._id,
      subCategory: 'sofa',
      basePrice: 129999,

      configurations: {
        sizes: [
          { name: 'Single Module', code: 'single', priceModifier: 0 },
          { name: '2-Seater', code: 'double', priceModifier: 89999 },
          { name: '3-Seater', code: 'triple', priceModifier: 169999 }
        ],
        colors: [
          { name: 'Mint Green', code: 'mint', hex: '#a8e6cf', priceModifier: 0 },
          { name: 'Navy Blue', code: 'navy', hex: '#2c3e50', priceModifier: 5000 }
        ],
        materials: [
          { name: 'Premium Velvet', code: 'velvet', priceModifier: 0 },
          { name: 'Leather', code: 'leather', priceModifier: 80000 }
        ]
      },

      images: {
        thumbnail: 'https://example.com/sofa-thumb.jpg',
        gallery: [
          'https://example.com/sofa-1.jpg',
          'https://example.com/sofa-2.jpg'
        ],
        model3D: {   // ✅ FIXED HERE
          url: 'https://example.com/cloud-sofa.glb',
          format: 'glb'
        }
      },

      inventory: {
        sku: 'CF-SOFA-001',
        stockStatus: 'in_stock',
        quantity: 50
      },

      isFeatured: true
    });

    console.log('Product seeded:', cloudSofa.name);
    console.log('Database seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
//// seed.js - Database Seeding
// const mongoose = require('mongoose');
// const Product = require('./models/Product');
// const Category = require('./models/Category');
// const User = require('./models/User');

// const seedData = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxefurniture');
    
//     // Clear existing data
//     await Product.deleteMany({});
//     await Category.deleteMany({});
//     await User.deleteMany({});
    
//     // Create admin user
//     const admin = await User.create({
//       email: 'admin@luxefurniture.com',
//       password: 'admin123',
//       firstName: 'Admin',
//       lastName: 'User',
//       role: 'admin'
//     });
    
//     console.log('Admin created:', admin.email);
    
//     // Create categories
//     const livingRoom = await Category.create({
//       name: 'Living Room',
//       slug: 'living-room',
//       description: 'Sofas, chairs, and living room essentials'
//     });
    
//     const bedroom = await Category.create({
//       name: 'Bedroom',
//       slug: 'bedroom',
//       description: 'Beds, mattresses, and bedroom furniture'
//     });
    
//     // Create products
//     const cloudSofa = await Product.create({
//       name: 'Cloud Modular Sofa',
//       slug: 'cloud-modular-sofa',
//       description: 'Experience ultimate comfort with our signature tufted modular sofa. Features deep seats, plush cushions, and endless configuration possibilities.',
//       shortDescription: 'Modular comfort redefined',
//       category: livingRoom._id,
//       subCategory: 'sofa',
//       basePrice: 129999, // INR
//       configurations: {
//         sizes: [
//           { name: 'Single Module', code: 'single', width: 90, depth: 90, height: 75, priceModifier: 0, dimensions: { metric: '90x90x75 cm', imperial: '35x35x30 in' } },
//           { name: '2-Seater', code: 'double', width: 180, depth: 90, height: 75, priceModifier: 89999, dimensions: { metric: '180x90x75 cm', imperial: '71x35x30 in' } },
//           { name: '3-Seater', code: 'triple', width: 240, depth: 90, height: 75, priceModifier: 169999, dimensions: { metric: '240x90x75 cm', imperial: '94x35x30 in' } },
//           { name: 'L-Shape Large', code: 'lshape', width: 270, depth: 180, height: 75, priceModifier: 249999, dimensions: { metric: '270x180x75 cm', imperial: '106x71x30 in' } }
//         ],
//         colors: [
//           { name: 'Mint Green', code: 'mint', hex: '#a8e6cf', priceModifier: 0 },
//           { name: 'Cream', code: 'cream', hex: '#f4e4c1', priceModifier: 0 },
//           { name: 'Navy Blue', code: 'navy', hex: '#2c3e50', priceModifier: 5000 },
//           { name: 'Saddle Leather', code: 'leather', hex: '#8b4513', priceModifier: 45000 },
//           { name: 'Blush Pink', code: 'blush', hex: '#d4a5a5', priceModifier: 0 },
//           { name: 'Charcoal', code: 'charcoal', hex: '#333333', priceModifier: 0 }
//         ],
//         materials: [
//           { name: 'Premium Velvet', code: 'velvet', type: 'velvet', priceModifier: 0, description: 'High-pile cotton velvet with stain-resistant treatment', careInstructions: ['Vacuum regularly', 'Spot clean with damp cloth'] },
//           { name: 'Belgian Linen', code: 'linen', type: 'linen', priceModifier: 15000, description: 'Stone-washed Belgian linen, naturally antimicrobial', careInstructions: ['Dry clean recommended', 'Avoid direct sunlight'] },
//           { name: 'Full Grain Leather', code: 'leather', type: 'leather', priceModifier: 80000, description: 'Italian full-grain aniline leather', careInstructions: ['Condition every 6 months', 'Keep away from heat sources'] },
//           { name: 'Bouclé Wool', code: 'boucle', type: 'boucle', priceModifier: 25000, description: 'Textured wool blend for contemporary look', careInstructions: ['Professional cleaning only'] }
//         ],
//         legs: [
//           { name: 'Black Wood', code: 'black-wood', material: 'wood', finish: 'matte black', priceModifier: 0 },
//           { name: 'Oak Natural', code: 'oak', material: 'wood', finish: 'natural oil', priceModifier: 5000 },
//           { name: 'Brass Metal', code: 'brass', material: 'metal', finish: 'polished brass', priceModifier: 8000 },
//           { name: 'Chrome', code: 'chrome', material: 'metal', finish: 'mirrored chrome', priceModifier: 6000 }
//         ],
//         addons: [
//           { name: 'Ottoman', code: 'ottoman', price: 29999, description: 'Matching storage ottoman' },
//           { name: 'Throw Pillows Set', code: 'pillows', price: 4999, description: '2 designer throw pillows' },
//           { name: 'Protection Plan', code: 'warranty', price: 12999, description: '5-year extended warranty' }
//         ]
//       },
//       images: {
//         thumbnail: 'https://example.com/sofa-thumb.jpg',
//         gallery: ['https://example.com/sofa-1.jpg', 'https://example.com/sofa-2.jpg'],
//         3dModel: {
//           url: 'https://example.com/cloud-sofa.glb',
//           format: 'glb'
//         }
//       },
//       inventory: {
//         sku: 'CF-SOFA-001',
//         stockStatus: 'in_stock',
//         quantity: 50,
//         leadTime: 2
//       },
//       isFeatured: true,
//       warranty: {
//         duration: 60,
//         description: '5-year structural warranty'
//       }
//     });
    
//     console.log('Products seeded:', cloudSofa.name);
//     console.log('Database seeded successfully!');
    
//     process.exit();
//   } catch (error) {
//     console.error('Seeding error:', error);
//     process.exit(1);
//   }
// };

// seedData();