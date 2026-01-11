const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');

// Hospital registration
const hospitalRegister = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, location, contactInfo, capacity, specializations } = req.body;

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const hospital = await Hospital.create({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      location,
      contactInfo,
      capacity,
      specializations,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Waiting for admin approval.',
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Hospital login
const hospitalLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ email });
    
    // Not in database
    if (!hospital) {
      return res.status(401).json({ message: 'Account does not exist' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, hospital.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check approval status
    if (hospital.status === 'pending') {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    // Only approved hospitals can login
    const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get approved hospitals (for public listing)
const getApprovedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'approved' })
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get hospital donors
const getHospitalDonors = async (req, res) => {
  try {
    const donors = await Donor.find({ registeredHospital: req.hospital.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { donors }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add donor
const addDonor = async (req, res) => {
  try {
    const donorData = {
      ...req.body,
      registeredHospital: req.hospital.id
    };

    const donor = await Donor.create(donorData);

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully',
      data: { donor }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  hospitalRegister,
  hospitalLogin,
  getApprovedHospitals,
  getHospitalDonors,
  addDonor
};