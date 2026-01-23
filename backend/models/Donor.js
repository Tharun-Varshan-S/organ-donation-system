import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] }
  },
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    weight: Number,
    height: Number,
    medicalHistory: [String],
    allergies: [String],
    medications: [String]
  },
  donationPreferences: {
    organTypes: [{
      type: String,
      enum: ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea', 'tissue', 'bone']
    }],
    isLivingDonor: { type: Boolean, default: false }
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased', 'matched', 'unavailable'],
    default: 'active'
  },
  timeline: [{
    event: String,
    timestamp: { type: Date, default: Date.now },
    details: String
  }],
  isEmergencyEligible: { type: Boolean, default: false },
  registeredHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Donor', donorSchema);

