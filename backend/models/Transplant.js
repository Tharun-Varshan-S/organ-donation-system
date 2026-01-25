import mongoose from 'mongoose';

const transplantSchema = new mongoose.Schema({
  transplantId: {
    type: String,
    unique: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  recipient: {
    name: String,
    age: Number,
    bloodType: String,
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  surgeryDate: Date // Add surgeryDate field for compatibility
  },
  organType: {
    type: String,
    enum: ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea'],
    required: true
  },
  surgeryDetails: {
    scheduledDate: Date,
    actualDate: Date,
    duration: Number, // in minutes
    surgeonName: String,
    operatingRoom: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  outcome: {
    success: { type: Boolean, default: null },
    complications: [String],
    notes: String,
    followUpRequired: { type: Boolean, default: true }
  },
  transportDetails: {
    pickupHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    deliveryHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    transportTime: Number, // in minutes
    preservationMethod: String
  }
}, {
  timestamps: true
});

// Generate unique transplant ID
transplantSchema.pre('save', async function (next) {
  if (!this.transplantId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.transplantId = `TRANS-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Transplant', transplantSchema);

