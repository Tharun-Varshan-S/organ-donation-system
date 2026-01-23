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

  // Status check moved to middleware/frontend redirect logic
  // if (hospital.status !== 'approved') { ... }

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
    transplantCount,
    recentActivity,
    criticalRequests,
    slaHealth,
    hospitalProfile
  ] = await Promise.all([
    // Donor Stats
    Donor.aggregate([
      { $match: { registeredHospital: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          unavailable: { $sum: { $cond: [{ $eq: ["$status", "unavailable"] }, 1, 0] } },
          deceased: { $sum: { $cond: [{ $eq: ["$status", "deceased"] }, 1, 0] } },
          emergencyEligible: { $sum: { $cond: [{ $eq: ["$isEmergencyEligible", true] }, 1, 0] } }
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
          emergency: { $sum: { $cond: [{ $eq: ["$patient.urgencyLevel", "critical"] }, 1, 0] } },
          slaBreached: { $sum: { $cond: [{ $eq: ["$slaBreached", true] }, 1, 0] } },
          emergencyLocked: { $sum: { $cond: [{ $eq: ["$isEmergencyLocked", true] }, 1, 0] } }
        }
      }
    ]),

    // Transplant Stats
    Transplant.aggregate([
      { $match: { 'recipient.hospital': new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          successful: { $sum: { $cond: [{ $eq: ["$outcome.success", true] }, 1, 0] } }
        }
      }
    ]),

    // Recent Activity (Audit Logs)
    AuditLog.find({ 'performedBy.id': hospitalId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Critical Requests
    Request.find({
      hospital: hospitalId,
      'patient.urgencyLevel': 'critical',
      status: { $ne: 'completed' }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // SLA Health Analysis
    Request.aggregate([
      { $match: { hospital: new mongoose.Types.ObjectId(hospitalId), status: { $ne: 'completed' } } },
      {
        $project: {
          slaDueDate: 1,
          slaBreached: 1,
          createdAt: 1,
          urgencyLevel: '$patient.urgencyLevel',
          timeRemaining: {
            $subtract: ['$slaDueDate', new Date()]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalActive: { $sum: 1 },
          breached: { $sum: { $cond: [{ $eq: ["$slaBreached", true] }, 1, 0] } },
          atRisk: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: [{ $subtract: ['$slaDueDate', new Date()] }, 24 * 60 * 60 * 1000] },
                    { $eq: ["$slaBreached", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]),

    // Hospital Profile for operational readiness
    Hospital.findById(hospitalId).select('isEmergencyReady stats').lean()
  ]);

  const donors = donorStats[0] || { total: 0, active: 0, unavailable: 0, deceased: 0, emergencyEligible: 0 };
  const requests = requestStats[0] || { total: 0, active: 0, emergency: 0, slaBreached: 0, emergencyLocked: 0 };
  const transplants = transplantCount[0] || { total: 0, completed: 0, successful: 0 };
  const sla = slaHealth[0] || { totalActive: 0, breached: 0, atRisk: 0 };

  // Calculate SLA compliance rate
  const slaCompliance = sla.totalActive > 0
    ? ((sla.totalActive - sla.breached) / sla.totalActive * 100).toFixed(1)
    : 100;

  // Calculate success rate
  const successRate = transplants.completed > 0
    ? ((transplants.successful / transplants.completed) * 100).toFixed(1)
    : hospitalProfile?.stats?.successRate || 0;

  // Operational Readiness Score
  const operationalReadiness = {
    emergencyReady: hospitalProfile?.isEmergencyReady || false,
    slaHealth: slaCompliance >= 90 ? 'excellent' : slaCompliance >= 70 ? 'good' : 'needs_attention',
    donorAvailability: donors.active > 0 ? 'available' : 'limited',
    criticalAlerts: requests.emergency
  };

  res.status(200).json({
    success: true,
    data: {
      donors: {
        total: donors.total,
        active: donors.active,
        unavailable: donors.unavailable,
        deceased: donors.deceased,
        emergencyEligible: donors.emergencyEligible
      },
      requests: {
        total: requests.total,
        active: requests.active,
        emergency: requests.emergency,
        emergencyLocked: requests.emergencyLocked,
        slaBreached: requests.slaBreached || 0
      },
      transplants: {
        total: transplants.total,
        completed: transplants.completed,
        successful: transplants.successful,
        successRate: parseFloat(successRate)
      },
      slaHealth: {
        complianceRate: parseFloat(slaCompliance),
        totalActive: sla.totalActive,
        breached: sla.breached,
        atRisk: sla.atRisk
      },
      operationalReadiness,
      criticalRequests: criticalRequests || [],
      recentActivity: recentActivity || []
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
  req.body.timeline = [{
    event: 'REGISTERED',
    details: 'Donor registered with hospital',
    timestamp: new Date()
  }];

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

  // Check for status change to track in timeline
  if (req.body.status && req.body.status !== donor.status) {
    const updateData = { ...req.body };
    if (!updateData.timeline) updateData.timeline = [...donor.timeline];
    updateData.timeline.push({
      event: 'STATUS_CHANGE',
      details: `Status changed from ${donor.status} to ${req.body.status}`,
      timestamp: new Date()
    });
    donor = await Donor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
  } else {
    donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  }

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

  // SLA Calculation
  const urgency = req.body.patient?.urgencyLevel || 'medium';
  let hoursToAdd = 48; // Default Medium
  if (urgency === 'critical') hoursToAdd = 4;
  else if (urgency === 'high') hoursToAdd = 24;
  else if (urgency === 'low') hoursToAdd = 168; // 7 days

  const slaDueDate = new Date();
  slaDueDate.setHours(slaDueDate.getHours() + hoursToAdd);
  req.body.slaDueDate = slaDueDate;

  // Emergency Lock
  if (urgency === 'critical') {
    req.body.isEmergencyLocked = true;
  }

  // Lifecycle Init
  req.body.lifecycle = [{
    status: 'pending',
    details: 'Request created',
    timestamp: new Date()
  }];

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
      priority: 'critical',
      title: 'CRITICAL REQUEST LOCKED',
      message: `Critical request REQ-${request.requestId} has been locked to Emergency Mode. Auto-escalated to Admin.`,
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
  const transplants = await Transplant.find({ 
    'recipient.hospital': req.hospital.id 
  })
    .populate('donor', 'personalInfo.firstName personalInfo.lastName medicalInfo.bloodType')
    .populate('request', 'requestId patient.name organType')
    .sort({ 'surgeryDetails.scheduledDate': -1, createdAt: -1 });

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
    'recipient.hospital': req.hospital.id
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

    // Auto-calculate success rate (simple moving average logic or similar could go here, but for now simple ratio)
    const stats = await Transplant.aggregate([
      { $match: { 'recipient.hospital': new mongoose.Types.ObjectId(req.hospital.id), status: 'completed' } },
      { $group: { _id: null, total: { $sum: 1 }, successful: { $sum: { $cond: [{ $eq: ["$outcome.success", true] }, 1, 0] } } } }
    ]);
    if (stats.length > 0 && stats[0].total > 0) {
      const rate = (stats[0].successful / stats[0].total) * 100;
      await Hospital.findByIdAndUpdate(req.hospital.id, { 'stats.successRate': rate });
    }
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

// @desc    Update Request with Delay Reason (SLA Breach)
// @route   PUT /api/hospital/requests/:id/delay-reason
// @access  Private (Approved Hospital)
const updateRequestDelayReason = asyncHandler(async (req, res) => {
  const { delayReason } = req.body;

  if (!delayReason) {
    throw new ErrorResponse('Delay reason is required', 400);
  }

  const request = await Request.findOne({
    _id: req.params.id,
    hospital: req.hospital.id
  });

  if (!request) {
    throw new ErrorResponse('Request not found or unauthorized', 404);
  }

  // Update delay reason and mark as breached if not already
  request.delayReason = delayReason;
  if (!request.slaBreached) {
    request.slaBreached = true;
  }

  // Add to lifecycle
  request.lifecycle.push({
    status: request.status,
    details: `SLA breached. Reason: ${delayReason}`,
    timestamp: new Date()
  });

  await request.save();

  await AuditLog.create({
    actionType: 'UPDATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'REQUEST',
    entityId: request._id,
    details: `SLA breach reason logged: ${delayReason}`
  });

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Get Emergency Summary
// @route   GET /api/hospital/emergency-summary
// @access  Private (Approved Hospital)
const getEmergencySummary = asyncHandler(async (req, res) => {
  const hospitalId = req.hospital.id;

  const [criticalRequests, emergencyDonors] = await Promise.all([
    Request.find({
      hospital: hospitalId,
      'patient.urgencyLevel': 'critical',
      status: { $ne: 'completed' }
    })
      .populate('matchedDonor', 'personalInfo.firstName personalInfo.lastName medicalInfo.bloodType')
      .sort({ createdAt: -1 })
      .lean(),

    Donor.find({
      registeredHospital: hospitalId,
      isEmergencyEligible: true,
      status: 'active'
    })
      .select('personalInfo.firstName personalInfo.lastName medicalInfo.bloodType donationPreferences.organTypes')
      .lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      criticalRequests: criticalRequests || [],
      emergencyDonors: emergencyDonors || [],
      totalCritical: criticalRequests.length,
      totalEmergencyDonors: emergencyDonors.length
    }
  });
});

// @desc    Get Hospital Analytics
// @route   GET /api/hospital/analytics
// @access  Private (Approved Hospital)
const getHospitalAnalytics = asyncHandler(async (req, res) => {
  const hospitalId = req.hospital.id;
  const { period = '30' } = req.query; // days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  const [
    slaCompliance,
    successRates,
    donorConversion,
    requestTrends
  ] = await Promise.all([
    // SLA Compliance Analysis
    Request.aggregate([
      {
        $match: {
          hospital: new mongoose.Types.ObjectId(hospitalId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          breached: { $sum: { $cond: [{ $eq: ["$slaBreached", true] }, 1, 0] } },
          onTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $eq: ["$slaBreached", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]),

    // Success Rates
    Transplant.aggregate([
      {
        $match: {
          'recipient.hospital': new mongoose.Types.ObjectId(hospitalId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$organType',
          total: { $sum: 1 },
          successful: { $sum: { $cond: [{ $eq: ["$outcome.success", true] }, 1, 0] } }
        }
      }
    ]),

    // Donor Conversion (Donors who became matched/used)
    Donor.aggregate([
      {
        $match: {
          registeredHospital: new mongoose.Types.ObjectId(hospitalId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    // Request Trends by Status
    Request.aggregate([
      {
        $match: {
          hospital: new mongoose.Types.ObjectId(hospitalId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            status: '$status',
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ])
  ]);

  const sla = slaCompliance[0] || { total: 0, completed: 0, breached: 0, onTime: 0 };
  const slaComplianceRate = sla.total > 0 ? ((sla.total - sla.breached) / sla.total * 100).toFixed(1) : 100;

  // Calculate overall success rate
  const totalTransplants = successRates.reduce((sum, item) => sum + item.total, 0);
  const totalSuccessful = successRates.reduce((sum, item) => sum + item.successful, 0);
  const overallSuccessRate = totalTransplants > 0 ? (totalSuccessful / totalTransplants * 100).toFixed(1) : 0;

  // Donor conversion: active + matched vs total
  const totalDonors = donorConversion.reduce((sum, item) => sum + item.count, 0);
  const activeDonors = donorConversion.find(d => d._id === 'active')?.count || 0;
  const matchedDonors = donorConversion.find(d => d._id === 'matched')?.count || 0;
  const donorConversionRate = totalDonors > 0 ? (((activeDonors + matchedDonors) / totalDonors) * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      slaCompliance: {
        rate: parseFloat(slaComplianceRate),
        total: sla.total,
        completed: sla.completed,
        breached: sla.breached,
        onTime: sla.onTime
      },
      successRates: {
        overall: parseFloat(overallSuccessRate),
        byOrgan: successRates.map(item => ({
          organType: item._id,
          total: item.total,
          successful: item.successful,
          rate: item.total > 0 ? ((item.successful / item.total) * 100).toFixed(1) : 0
        }))
      },
      donorConversion: {
        rate: parseFloat(donorConversionRate),
        total: totalDonors,
        active: activeDonors,
        matched: matchedDonors
      },
      requestTrends: requestTrends || []
    }
  });
});

// @desc    Get Donor with Full Timeline
// @route   GET /api/hospital/donors/:id/timeline
// @access  Private (Approved Hospital)
const getDonorTimeline = asyncHandler(async (req, res) => {
  const donor = await Donor.findOne({
    _id: req.params.id,
    registeredHospital: req.hospital.id
  })
    .populate({
      path: 'registeredHospital',
      select: 'name'
    })
    .lean();

  if (!donor) {
    throw new ErrorResponse('Donor not found or unauthorized', 404);
  }

  // Get related requests and transplants for timeline
  const [relatedRequests, relatedTransplants] = await Promise.all([
    Request.find({ matchedDonor: donor._id })
      .select('requestId patient.name organType status createdAt')
      .lean(),
    Transplant.find({ donor: donor._id })
      .select('transplantId organType status outcome.success surgeryDetails.actualDate')
      .lean()
  ]);

  // Build comprehensive timeline
  const timeline = [
    ...(donor.timeline || []).map(event => ({
      ...event,
      type: 'donor_event'
    })),
    ...(relatedRequests || []).map(req => ({
      event: 'REQUEST_MATCHED',
      timestamp: req.createdAt,
      details: `Matched to request ${req.requestId} for ${req.patient.name} (${req.organType})`,
      type: 'request_event',
      relatedId: req._id
    })),
    ...(relatedTransplants || []).map(tx => ({
      event: 'TRANSPLANT_COMPLETED',
      timestamp: tx.surgeryDetails?.actualDate || tx.createdAt,
      details: `Transplant ${tx.transplantId} completed. Outcome: ${tx.outcome?.success ? 'Success' : 'Failed'}`,
      type: 'transplant_event',
      relatedId: tx._id
    }))
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.status(200).json({
    success: true,
    data: {
      donor,
      timeline,
      relatedRequests,
      relatedTransplants
    }
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
  markNotificationRead,
  updateRequestDelayReason,
  getEmergencySummary,
  getHospitalAnalytics,
  getDonorTimeline
};

