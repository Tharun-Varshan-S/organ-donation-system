const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  contactInfo: {
    phone: String,
    emergencyPhone: String
  },
  capacity: {
    totalBeds: { type: Number, default: 0 },
    icuBeds: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  specializations: [String],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);