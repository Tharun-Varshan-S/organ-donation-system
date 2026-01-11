const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  age: Number,
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  address: String,
  organTypes: [{
    type: String,
    enum: ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea']
  }],
  registeredHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donor', donorSchema);