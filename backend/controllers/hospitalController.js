import jwt from 'jsonwebtoken';
import Hospital from '../models/Hospital.js';
import { ErrorResponse, asyncHandler } from '../middleware/error.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Hospital registration
// @route   POST /api/hospital/register
// @access  Public
const hospitalRegister = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    licenseNumber,
    phone,
    address,
    city,
    state,
    zipCode,
    specializations
  } = req.body;

  // Validation
  if (!name || !email || !password || !licenseNumber) {
    throw new ErrorResponse('Please provide name, email, password, and license number', 400);
  }

  // Check if hospital already exists
  const existingHospital = await Hospital.findOne({
    $or: [{ email }, { licenseNumber }]
  });

  if (existingHospital) {
    if (existingHospital.email === email) {
      throw new ErrorResponse('Hospital with this email already exists', 400);
    }
    if (existingHospital.licenseNumber === licenseNumber) {
      throw new ErrorResponse('Hospital with this license number already exists', 400);
    }
  }

  // Create hospital
  const hospitalData = {
    name,
    email,
    password, // Will be hashed by pre-save middleware
    licenseNumber,
    contactInfo: {
      phone: phone || undefined
    },
    location: {
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined
    },
    specializations: specializations || []
  };

  const hospital = await Hospital.create(hospitalData);

  // Generate token
  const token = generateToken(hospital._id);

  res.status(201).json({
    success: true,
    message: 'Hospital registration successful. Your account is pending approval.',
    data: {
      token,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        licenseNumber: hospital.licenseNumber,
        status: hospital.status
      }
    }
  });
});

// @desc    Hospital login
// @route   POST /api/hospital/login
// @access  Public
const hospitalLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  // Check if hospital exists (include password field)
  const hospital = await Hospital.findOne({ email }).select('+password');

  if (!hospital) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if hospital is active
  if (!hospital.isActive) {
    throw new ErrorResponse('Hospital account is deactivated', 401);
  }

  // Check if hospital is approved
  if (hospital.status !== 'approved') {
    throw new ErrorResponse(`Hospital account is ${hospital.status}. Please wait for admin approval.`, 403);
  }

  // Check password
  const isPasswordMatch = await hospital.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Update last login
  hospital.lastLogin = new Date();
  await hospital.save();

  // Generate token
  const token = generateToken(hospital._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    hospital: {
      id: hospital._id,
      name: hospital.name,
      email: hospital.email,
      licenseNumber: hospital.licenseNumber,
      status: hospital.status,
      lastLogin: hospital.lastLogin
    }
  });
});

// @desc    Get hospital profile
// @route   GET /api/hospital/profile
// @access  Private (Hospital)
const getHospitalProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.hospital.id).select('-password');

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  res.status(200).json({
    success: true,
    data: hospital
  });
});

// @desc    Update hospital profile
// @route   PUT /api/hospital/profile
// @access  Private (Hospital)
const updateHospitalProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    emergencyPhone,
    address,
    city,
    state,
    zipCode,
    specializations,
    totalBeds,
    availableBeds
  } = req.body;

  const hospital = await Hospital.findById(req.hospital.id);

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  // Update fields
  if (name) hospital.name = name;
  if (phone) hospital.contactInfo.phone = phone;
  if (emergencyPhone) hospital.contactInfo.emergencyPhone = emergencyPhone;
  if (address) hospital.location.address = address;
  if (city) hospital.location.city = city;
  if (state) hospital.location.state = state;
  if (zipCode) hospital.location.zipCode = zipCode;
  if (specializations) hospital.specializations = specializations;
  if (totalBeds !== undefined) hospital.capacity.totalBeds = totalBeds;
  if (availableBeds !== undefined) hospital.capacity.availableBeds = availableBeds;

  await hospital.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: hospital
  });
});

export {
  hospitalRegister,
  hospitalLogin,
  getHospitalProfile,
  updateHospitalProfile
};
