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

// @desc    Get all APPROVED hospitals (Public)
export const getPublicHospitals = async (req, res) => {
  try {
    const { search, state, specialization } = req.query;

    let query = { status: 'approved' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    if (state) query['location.state'] = state;
    if (specialization) query.specializations = specialization;

    const hospitals = await Hospital.find(query)
      .select('-password -licenseNumber -approvedBy -approvedAt -createdAt -updatedAt -__v')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });

  } catch (error) {
    console.error('Get public hospitals error:', error);
    res.status(500).json({ success: false, message: 'Error fetching hospitals' });
  }
};

// @desc    Get single hospital details (Public)
export const getPublicHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      _id: req.params.id,
      status: 'approved'
    }).select('-password -licenseNumber -approvedBy -approvedAt');

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found or not approved' });
    }

    res.status(200).json({ success: true, data: hospital });

  } catch (error) {
    console.error('Get hospital details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching hospital details' });
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
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user',
        bloodType: user.bloodType,
        organ: user.organ,
        isDonor: user.isDonor,
        visibilityStatus: user.visibilityStatus,
        availabilityStatus: user.availabilityStatus
      }
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
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.isDonor ? 'donor' : 'user',
        bloodType: user.bloodType,
        organ: user.organ,
        isDonor: user.isDonor,
        phone: user.phone,
        visibilityStatus: user.visibilityStatus,
        availabilityStatus: user.availabilityStatus,
        donations: user.donations
      }
    });
  } catch (error) {
    console.error('User Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.phone = req.body.phone || user.phone;
    user.visibilityStatus = req.body.visibilityStatus || user.visibilityStatus;
    user.availabilityStatus = req.body.availabilityStatus || user.availabilityStatus;

    // Allow updating other fields if needed, but per requirements these are key
    if (req.body.name) user.name = req.body.name;
    if (req.body.organ) user.organ = req.body.organ;
    if (req.body.bloodType) user.bloodType = req.body.bloodType;

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user donation history
// @route   GET /api/users/history
// @access  Private
// NOTE: This assumes donations are stored in the user model or a separate Donation model. 
// For now, checking user.donations array as per likely Schema extension.
export const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('donations');
    // If donations are refs, populate. If embedded objects, just return.
    // Assuming simple embedded or basic list for now.
    res.status(200).json({ success: true, data: user.donations || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};