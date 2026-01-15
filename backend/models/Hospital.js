const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1000' // Mock default
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    // Enhanced: For admin map rendering
    latitude: Number,
    longitude: Number,
    region: String
  },
  contactInfo: {
    phone: String,
    emergencyPhone: String
  },
  capacity: {
    totalBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending'
  },
  specializations: [String],
  // Enhanced: Admin-only aggregated stats
  stats: {
    donorCount: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
    successfulTransplants: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },
  // Enhanced: User reviews (read-only for admins)
  reviews: [{
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    verified: { type: Boolean, default: false },
    reviewerMasked: String, // Masked identity
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,
  suspensionReason: String,
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
hospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
hospitalSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Hospital', hospitalSchema);