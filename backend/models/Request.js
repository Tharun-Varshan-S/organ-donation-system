const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  patient: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    medicalCondition: String,
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  organType: {
    type: String,
    enum: ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  matchedDonor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  },
  notes: String,
  expiryDate: Date
}, {
  timestamps: true
});

// Generate unique request ID
requestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.requestId = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema);