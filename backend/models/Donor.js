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
    enum: ['active', 'inactive', 'deceased', 'matched'],
    default: 'active'
  },
    registeredHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  confidentialData: {
    pii: {
      fullName: String,
      governmentId: String,
      dateOfBirthExact: Date,
      genderExact: String,
      photograph: String,
    },
    contactInfo: {
      phoneNumber: String,
      emailAddress: String,
      emergencyContact: String,
      alternateContacts: [String],
    },
    preciseLocation: {
      fullHomeAddress: String,
      pinCode: String,
      gpsCoordinates: String,
    },
    detailedMedicalRecords: {
      fullMedicalHistoryReports: [String], // Array of document IDs or URLs
      pastSurgeries: [String],
      chronicIllnesses: [String],
      mentalHealthHistory: [String],
      geneticDisorders: [String],
      familyMedicalHistory: [String],
    },
    labReports: {
      bloodTestReports: [String], // Array of document IDs or URLs
      hlaTypingReports: [String],
      crossMatchResults: [String],
      imagingReports: [String],
      pathologyReports: [String],
    },
    legalConsentDocuments: {
      signedDonorConsentForms: [String], // Array of document IDs or URLs
      organSpecificConsentDocuments: [String],
      livingWillDocuments: [String],
      legalGuardianApproval: [String],
    },
    financialInsuranceDetails: {
      insuranceProvider: String,
      policyNumbers: [String],
      coverageDetails: String,
      reimbursementEligibility: Boolean,
      bankPaymentDetails: String,
    },
    auditSensitiveFields: {
      internalDonorId: String,
      verificationStatusLogs: [String],
      ipAddressHistory: [String],
      loginActivity: [String],
      consentTimestamps: [Date],
    },
  },
  consentRequests: [
    {
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      requestedAt: { type: Date, default: Date.now },
      respondedAt: Date,
    },
  ]
}, {
  timestamps: true
});

export default mongoose.model('Donor', donorSchema);

