const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const pendingHospitals = await Hospital.countDocuments({ status: 'pending' });
    const approvedHospitals = await Hospital.countDocuments({ status: 'approved' });
    const totalDonors = await Donor.countDocuments();

    res.json({
      success: true,
      data: {
        totalHospitals,
        pendingHospitals,
        approvedHospitals,
        totalDonors
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all hospitals (pending + approved)
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve hospital
const approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.status = 'approved';
    hospital.approvedBy = req.admin.id;
    hospital.approvedAt = new Date();
    await hospital.save();

    res.json({
      success: true,
      message: 'Hospital approved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject hospital (DELETE from database)
const rejectHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Delete all donors registered by this hospital
    await Donor.deleteMany({ registeredHospital: hospital._id });
    
    // Delete the hospital
    await Hospital.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hospital rejected and removed from system'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  getHospitals,
  approveHospital,
  rejectHospital
};