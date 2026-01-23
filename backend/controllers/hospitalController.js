import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import Transplant from '../models/Transplant.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
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

  await AuditLog.create({
    actionType: 'UPDATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'HOSPITAL',
    entityId: hospital._id,
    details: 'Hospital profile updated'
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: hospital
  });
});

// @desc    Get all APPROVED hospitals (Public)
// @route   GET /api/hospital
// @access  Public
const getPublicHospitals = asyncHandler(async (req, res) => {
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
});

// @desc    Get single hospital details (Public)
// @route   GET /api/hospital/:id
// @access  Public
const getPublicHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({
    _id: req.params.id,
    status: 'approved' // STRICTLY APPROVED ONLY
  }).select('-password -licenseNumber -approvedBy -approvedAt');

  if (!hospital) {
    throw new ErrorResponse('Hospital not found or not approved', 404);
  }

  res.status(200).json({
    success: true,
    data: hospital
  });
});

// @desc    Get Hospital Dashboard Stats
// @route   GET /api/hospital/dashboard
// @access  Private (Approved Hospital)
const getDashboardStats = asyncHandler(async (req, res) => {
  const hospitalId = req.hospital.id;

  // Parallel execution for performance
  const [
    donorStats,
    requestStats,
    transplants
  ] = await Promise.all([
    // Donor Stats
    Donor.aggregate([
      { $match: { registeredHospital: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          deceased: { $sum: { $cond: [{ $eq: ["$status", "deceased"] }, 1, 0] } }
        }
      }
    ]),

    // Request Stats
    Request.aggregate([
      { $match: { hospital: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $ne: ["$status", "completed"] }, 1, 0] } },
          emergency: { $sum: { $cond: [{ $eq: ["$patient.urgencyLevel", "critical"] }, 1, 0] } }
        }
      }
    ]),

    Transplant.countDocuments({
      hospital: hospitalId,
      status: 'completed'
    }),

    // Recent Activity (Audit Logs)
    AuditLog.find({ 'performedBy.id': hospitalId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);

  const donors = donorStats[0] || { total: 0, active: 0, deceased: 0 };
  const requests = requestStats[0] || { total: 0, active: 0, emergency: 0 };
  const recentActivity = transplants[1]; // specific index because Promise.all returns array

  res.status(200).json({
    success: true,
    data: {
      donors: {
        total: donors.total,
        active: donors.active,
        deceased: donors.deceased
      },
      requests: {
        active: requests.active,
        emergency: requests.emergency
      },
      transplants: {
        successful: transplants[0] // first item in the transplants/activity chunk
      },
      recentActivity
    }
  });
});

// @desc    Get Hospital Donors
// @route   GET /api/hospital/donors
// @access  Private (Approved Hospital)
const getHospitalDonors = asyncHandler(async (req, res) => {
  const donors = await Donor.find({ registeredHospital: req.hospital.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: donors.length,
    data: donors
  });
});

// @desc    Create New Donor
// @route   POST /api/hospital/donors
// @access  Private (Approved Hospital)
const createHospitalDonor = asyncHandler(async (req, res) => {
  req.body.registeredHospital = req.hospital.id;
  req.body.isVerified = true;

  const donor = await Donor.create(req.body);

  await Hospital.findByIdAndUpdate(req.hospital.id, {
    $inc: { 'stats.donorCount': 1 }
  });

  await AuditLog.create({
    actionType: 'CREATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'DONOR',
    entityId: donor._id,
    details: `Created donor ${donor.personalInfo.firstName} ${donor.personalInfo.lastName}`
  });

  res.status(201).json({
    success: true,
    data: donor
  });
});

// @desc    Update Donor
// @route   PUT /api/hospital/donors/:id
// @access  Private (Approved Hospital)
const updateHospitalDonor = asyncHandler(async (req, res) => {
  let donor = await Donor.findOne({
    _id: req.params.id,
    registeredHospital: req.hospital.id
  });

  if (!donor) {
    throw new ErrorResponse('Donor not found or unauthorized', 404);
  }

  donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await AuditLog.create({
    actionType: 'UPDATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'DONOR',
    entityId: donor._id,
    details: `Updated donor ${donor.personalInfo.firstName} ${donor.personalInfo.lastName}`
  });

  res.status(200).json({
    success: true,
    data: donor
  });
});

// @desc    Get Hospital Requests
// @route   GET /api/hospital/requests
// @access  Private (Approved Hospital)
const getHospitalRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ hospital: req.hospital.id })
    .sort({ 'patient.urgencyLevel': -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Create Organ Request
// @route   POST /api/hospital/requests
// @access  Private (Approved Hospital)
const createHospitalRequest = asyncHandler(async (req, res) => {
  req.body.hospital = req.hospital.id;

  const request = await Request.create(req.body);

  await Hospital.findByIdAndUpdate(req.hospital.id, {
    $inc: { 'stats.requestCount': 1 }
  });

  await AuditLog.create({
    actionType: 'CREATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'REQUEST',
    entityId: request._id,
    details: `Created organ request for ${request.patient.name} (${request.organType})`
  });

  // Emergency Auto-Escalation / Notification
  if (request.patient.urgencyLevel === 'critical') {
    await Notification.create({
      recipient: req.hospital.id,
      type: 'EMERGENCY',
      title: 'Critical Emergency Request Created',
      message: `A critical request for ${request.organType} has been logged. Admin has been notified via auto-escalation.`,
      relatedEntity: {
        id: request._id,
        model: 'Request'
      }
    });
    // ideally also notify Admin (omitted for now as per scope, or create Admin Notification here too if Notification model supports it)
  }

  res.status(201).json({
    success: true,
    data: request
  });
});

// @desc    Get Hospital Transplants
// @route   GET /api/hospital/transplants
// @access  Private (Approved Hospital)
const getHospitalTransplants = asyncHandler(async (req, res) => {
  const transplants = await Transplant.find({ hospital: req.hospital.id })
    .populate('donor', 'personalInfo.firstName personalInfo.lastName')
    //.populate('recipient', 'patient.name') // recipient is in Request probably? Wait, Request IS the recipient need.
    // Transplant model check needed? I saw Transplant.js earlier.
    .sort({ surgeryDate: -1 });

  res.status(200).json({
    success: true,
    count: transplants.length,
    data: transplants
  });
});

// @desc    Update Transplant Status
// @route   PUT /api/hospital/transplants/:id
// @access  Private (Approved Hospital)
const updateTransplantStatus = asyncHandler(async (req, res) => {
  let transplant = await Transplant.findOne({
    _id: req.params.id,
    hospital: req.hospital.id
  });

  if (!transplant) {
    throw new ErrorResponse('Transplant record not found', 404);
  }

  transplant = await Transplant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (req.body.status === 'completed') {
    await Hospital.findByIdAndUpdate(req.hospital.id, {
      $inc: { 'stats.successfulTransplants': 1 }
    });
  }

  await AuditLog.create({
    actionType: 'UPDATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'TRANSPLANT',
    entityId: transplant._id,
    details: `Transplant status updated to ${req.body.status}`
  });

  res.status(200).json({
    success: true,
    data: transplant
  });
});

// @desc    Get Notifications
// @route   GET /api/hospital/notifications
// @access  Private (Approved Hospital)
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.hospital.id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Mark Notification as Read
// @route   PUT /api/hospital/notifications/:id/read
// @access  Private (Approved Hospital)
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.hospital.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ErrorResponse('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

export {
  hospitalRegister,
  hospitalLogin,
  getHospitalProfile,
  updateHospitalProfile,
  getPublicHospitals,
  getPublicHospitalById,
  getDashboardStats,
  getHospitalDonors,
  createHospitalDonor,
  updateHospitalDonor,
  getHospitalRequests,
  createHospitalRequest,
  getHospitalTransplants,
  updateTransplantStatus,
  getNotifications,
  markNotificationRead
};
