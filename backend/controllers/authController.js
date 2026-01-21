import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';
<<<<<<< HEAD
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
=======

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

<<<<<<< HEAD
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
=======
// @desc    Admin registration
// @route   POST /api/admin/register
// @access  Public (but requires secret key)
const adminRegister = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Validation
    if (!name || !email || !password || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and secret key'
      });
    }

    // Check secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin secret key'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password // Will be hashed by pre-save middleware
    });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registration successful',
      token,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
<<<<<<< HEAD
export const adminLogin = async (req, res) => {
=======
const adminLogin = async (req, res) => {
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
  try {
    const { email, password } = req.body;

    if (!email || !password) {
<<<<<<< HEAD
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

=======
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Hospital registration
// @route   POST /api/hospitals/register
// @access  Public
const hospitalRegister = async (req, res) => {
  try {
    const {
      name, email, password, licenseNumber,
      address, city, state, zipCode,
      phone, emergencyPhone,
      specializations
    } = req.body;

    // Validation checks...

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({
      $or: [{ email }, { licenseNumber }]
    });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: 'Hospital with this email or license already exists'
      });
    }

    // Create hospital - Status defaults to 'pending' as per schema
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
    const hospital = await Hospital.create({
      name,
      email,
      password,
      licenseNumber,
<<<<<<< HEAD
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
=======
      location: {
        address,
        city,
        state,
        zipCode
      },
      contactInfo: {
        phone,
        emergencyPhone
      },
      specializations: specializations || [],
      status: 'pending', // Explicitly enforced
      isActive: false    // Explicitly enforced
    });

    // We do NOT return a token for pending hospitals.
    // They must wait for approval.

    res.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for admin approval.',
      data: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.status
      }
    });

  } catch (error) {
    console.error('Hospital registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Hospital login
// @route   POST /api/hospitals/login
// @access  Public
const hospitalLogin = async (req, res) => {
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
  try {
    const { email, password } = req.body;

    if (!email || !password) {
<<<<<<< HEAD
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
=======
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if hospital exists
    const hospital = await Hospital.findOne({ email }).select('+password');

    // STRICT: IF NOT FOUND -> "Account does not exist" (Generic 401)
    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await hospital.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // STRICT STATUS CHECKS

    // PENDING -> "Waiting for Admin Approval"
    if (hospital.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Account is pending admin approval. Please wait.'
      });
    }

    // REJECTED -> Should not happen if filtered by findOne (if we deleted them), 
    // but if we had soft deletes or if schema was loose, we block here too.
    // Since we delete rejected, this block might be redundant but safe.
    if (hospital.status === 'rejected') {
      return res.status(403).json({ // Or 401 to feign non-existence
        success: false,
        message: 'Registration rejected.'
      });
    }

    // ONLY APPROVED ALLOWED
    if (hospital.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Generate token
    const token = generateToken(hospital._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.status,
        role: 'hospital'
      }
    });

  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all APPROVED hospitals (Public)
// @route   GET /api/hospitals
// @access  Public
const getPublicHospitals = async (req, res) => {
  try {
    const { search, state, specialization } = req.query;

    let query = { status: 'approved' }; // STRICTLY APPROVED ONLY

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
      .select('-password -licenseNumber -approvedBy -approvedAt -createdAt -updatedAt -__v') // Hide internal fields
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });

  } catch (error) {
    console.error('Get public hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospitals'
    });
  }
};

// @desc    Get single hospital details (Public)
// @route   GET /api/hospitals/:id
// @access  Public
const getPublicHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      _id: req.params.id,
      status: 'approved' // STRICTLY APPROVED ONLY
    }).select('-password -licenseNumber -approvedBy -approvedAt');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found or not approved'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });

  } catch (error) {
    console.error('Get hospital details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital details'
    });
  }
};

export {
  adminRegister,
  adminLogin,
  getAdminProfile,
  hospitalRegister,
  hospitalLogin,
  getPublicHospitals,
  getPublicHospitalById
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
};