// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    role: {
      type: String,
      enum: ['user', 'admin', 'designer'],
      default: 'user'
    },

    avatar: {
      type: String,
      default: ''
    },

    addresses: [
      {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' },
        isDefault: Boolean
      }
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],

    savedConfigurations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Configuration'
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    },

    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);


// 🔐 Hash password before saving (FIXED - no next)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw error;
  }
});


// 🔑 Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
// // models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: 6,
//     select: false
//   },
//   firstName: {
//     type: String,
//     required: [true, 'First name is required'],
//     trim: true
//   },
//   lastName: {
//     type: String,
//     required: [true, 'Last name is required'],
//     trim: true
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['user', 'admin', 'designer'],
//     default: 'user'
//   },
//   avatar: {
//     type: String,
//     default: ''
//   },
//   addresses: [{
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: { type: String, default: 'India' },
//     isDefault: Boolean
//   }],
//   wishlist: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   }],
//   savedConfigurations: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Configuration'
//   }],
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastLogin: Date,
//   resetPasswordToken: String,
//   resetPasswordExpire: Date
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);