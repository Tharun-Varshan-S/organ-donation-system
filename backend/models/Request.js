import mongoose from 'mongoose';
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
  expiryDate: Date,
  // SLA Tracking
  slaBreachedAt: Date,
  delayReason: String,
  isEmergency: { type: Boolean, default: false },
  emergencyEscalated: { type: Boolean, default: false },
  escalatedAt: Date,
  // Enhanced Architecture Fields
  eligibilityStatus: {
    type: String,
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending'
  },
  consentStatus: {
    type: String,
    enum: ['pending', 'given', 'denied'],
    default: 'pending'
  },
  confidentialDataRevealed: {
    type: Boolean,
    default: false
  },
  // Lifecycle tracking
  lifecycle: [{
    stage: { type: String, enum: ['created', 'matched', 'scheduled', 'in_progress', 'completed', 'cancelled', 'eligibility_validated', 'consent_given'] },
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate unique request ID
requestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.requestId = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Request', requestSchema);

