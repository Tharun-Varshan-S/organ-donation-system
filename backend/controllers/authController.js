import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ==========================================
// ADMIN AUTH
// ==========================================

// @desc    Admin registration
// @route   POST /api/admin/register
// @access  Public (Secret Key Required)
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (!name || !email || !password || !secretKey) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid admin secret key' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      data: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !await admin.comparePassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account deactivated' });
    }

    const token = generateToken(admin._id, 'admin');

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    res.status(200).json({
      success: true,
      token,
      data: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// HOSPITAL AUTH
// ==========================================

// @desc    Hospital Registration
// @route   POST /api/hospital/register
// @access  Public
export const hospitalRegister = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, address, city, state, zipCode, phone, specializations } = req.body;

    const existingHospital = await Hospital.findOne({ $or: [{ email }, { licenseNumber }] });
    if (existingHospital) {
      return res.status(400).json({ success: false, message: 'Hospital already exists (Email or License)' });
    }

    const hospital = await Hospital.create({
      name,
      email,
      password,
      licenseNumber,
      location: { address, city, state, zipCode },
      contactInfo: { phone },
      specializations: specializations || [],
      status: 'pending' // Default status
    });

    // NOTE: DO NOT return token. Waiting for approval.
    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval.',
      data: { id: hospital._id, status: 'pending' }
    });
  } catch (error) {
    console.error('Hospital Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Hospital Login
// @route   POST /api/hospital/login
// @access  Public
export const hospitalLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const hospital = await Hospital.findOne({ email }).select('+password');

    if (!hospital || !await hospital.comparePassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // STRICT STATUS CHECKS
    if (hospital.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your registration is under review' });
    }
    if (hospital.status === 'rejected') {
      return res.status(403).json({ success: false, message: `Registration rejected. Reason: ${hospital.rejectionReason || 'Not specified'}` });
    }
    if (hospital.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended.' });
    }
    if (hospital.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const token = generateToken(hospital._id, 'hospital');
    hospital.lastLogin = Date.now();
    await hospital.save();

    res.status(200).json({
      success: true,
      token,
      hospital: { id: hospital._id, name: hospital.name, email: hospital.email, status: hospital.status, role: 'hospital' }
    });
  } catch (error) {
    console.error('Hospital Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// USER AUTH
// ==========================================

// @desc    User Registration
// @route   POST /api/users/register
// @access  Public
export const userRegister = async (req, res) => {
  try {
    const { name, email, password, bloodType, isDonor } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      bloodType,
      isDonor: isDonor || false
    });

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: 'user' }
    });
  } catch (error) {
    console.error('User Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    User Login
// @route   POST /api/users/login
// @access  Public
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.matchPassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, 'user');

    res.status(200).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: 'user' }
    });
  } catch (error) {
    console.error('User Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Re-export specific generic get functions if needed by routes
export const getPublicHospitals = async (req, res) => {
  // This probably belongs in hospitalController but if auth routes use it...
  // No, auth routes don't use this.
  // I will include it here for completeness if needed, or leave it to hospitalController
  // It's better to leave it in hospitalController as it's not "Auth".
  res.status(501).json({ message: 'Not implemented in AuthController' });
};
export const getPublicHospitalById = async (req, res) => {
  res.status(501).json({ message: 'Not implemented in AuthController' });
};