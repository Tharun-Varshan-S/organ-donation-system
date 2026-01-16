const mongoose = require('mongoose');
require('dotenv').config();

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true },
  location: {
    city: String,
    state: String,
    address: String
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
  specializations: [String]
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

const sampleHospitals = [
  {
    name: "City Medical Center",
    email: "city@medical.com",
    licenseNumber: "LIC001",
    location: { city: "New York", state: "NY", address: "123 Main St" },
    contactInfo: { phone: "555-0123", emergencyPhone: "555-0911" },
    capacity: { totalBeds: 200, icuBeds: 50 },
    specializations: ["heart", "kidney", "liver"],
    status: "pending"
  },
  {
    name: "Regional Hospital",
    email: "regional@hospital.com",
    licenseNumber: "LIC002",
    location: { city: "Los Angeles", state: "CA", address: "456 Oak Ave" },
    contactInfo: { phone: "555-0456", emergencyPhone: "555-0922" },
    capacity: { totalBeds: 150, icuBeds: 30 },
    specializations: ["lung", "pancreas"],
    status: "approved"
  },
  {
    name: "Emergency Plus",
    email: "emergency@plus.com",
    licenseNumber: "LIC003",
    location: { city: "Chicago", state: "IL", address: "789 Pine Rd" },
    contactInfo: { phone: "555-0789", emergencyPhone: "555-0933" },
    capacity: { totalBeds: 100, icuBeds: 25 },
    specializations: ["emergency", "trauma"],
    status: "pending"
  }
];

async function seedHospitals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Hospital.deleteMany({}); // Clear existing
    await Hospital.insertMany(sampleHospitals);
    
    console.log('✅ Sample hospitals added!');
    console.log('- 2 pending hospitals (for admin to approve/reject)');
    console.log('- 1 approved hospital');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedHospitals();