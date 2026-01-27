import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import Transplant from '../models/Transplant.js';
import Doctor from '../models/Doctor.js';
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
  const now = new Date();

  // Parallel execution for performance
  const [
    donorStats,
    requestStats,
    transplants,
    recentActivity,
    slaStats
  ] = await Promise.all([
    // Donor Stats
    Donor.aggregate([
      { $match: { registeredHospital: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          deceased: { $sum: { $cond: [{ $eq: ["$status", "deceased"] }, 1, 0] } },
          unavailable: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } }
        }
      }
    ]),

    // Request Stats with SLA tracking
    Request.aggregate([
      { $match: { hospital: new mongoose.Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $ne: ["$status", "completed"] }, 1, 0] } },
          emergency: { $sum: { $cond: [{ $eq: ["$patient.urgencyLevel", "critical"] }, 1, 0] } },
          slaBreached: { $sum: { $cond: [{ $ne: ["$slaBreachedAt", null] }, 1, 0] } }
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
      .lean(),

    // SLA Health Indicators
    Request.aggregate([
      {
        $match: {
          hospital: new mongoose.Types.ObjectId(hospitalId),
          status: { $in: ['pending', 'matched'] }
        }
      },
      {
        $project: {
          urgencyLevel: '$patient.urgencyLevel',
          createdAt: 1,
          slaBreachedAt: 1,
          hoursElapsed: {
            $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60]
          }
        }
      },
      {
        $group: {
          _id: null,
          atRisk: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$slaBreachedAt', null] },
                    { $eq: ['$urgencyLevel', 'critical'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          nearBreach: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$slaBreachedAt', null] },
                    { $gte: ['$hoursElapsed', 20] },
                    { $eq: ['$urgencyLevel', 'critical'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);

  const donors = donorStats[0] || { total: 0, active: 0, deceased: 0, unavailable: 0 };
  const requests = requestStats[0] || { total: 0, active: 0, emergency: 0, slaBreached: 0 };
  const slaHealth = slaStats[0] || { atRisk: 0, nearBreach: 0 };
  const recentActivityData = recentActivity || [];

  // Get critical requests for emergency banner
  const criticalRequests = await Request.find({
    hospital: hospitalId,
    'patient.urgencyLevel': 'critical',
    status: { $in: ['pending', 'matched'] }
  })
    .sort({ createdAt: 1 })
    .limit(5)
    .select('requestId patient.name organType createdAt isEmergency')
    .lean();

  res.status(200).json({
    success: true,
    data: {
      donors: {
        total: donors.total,
        active: donors.active,
        deceased: donors.deceased,
        unavailable: donors.unavailable
      },
      requests: {
        active: requests.active,
        emergency: requests.emergency,
        slaBreached: requests.slaBreached
      },
      transplants: {
        successful: transplants
      },
      recentActivity: recentActivityData,
      slaHealth: {
        atRisk: slaHealth.atRisk,
        nearBreach: slaHealth.nearBreach,
        operationalReadiness: slaHealth.atRisk === 0 && slaHealth.nearBreach === 0 ? 'ready' : 'attention'
      },
      criticalRequests
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

  // Set emergency flag and lock if critical
  if (req.body.patient?.urgencyLevel === 'critical') {
    req.body.isEmergency = true;
  }

  // Initialize lifecycle
  req.body.lifecycle = [{
    stage: 'created',
    timestamp: new Date(),
    notes: 'Request created'
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
    request.emergencyEscalated = true;
    request.escalatedAt = new Date();
    await request.save();

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

    // Notify Admin (assuming Admin model exists and Notification supports admin recipients)
    // This would require checking if Notification model supports admin recipients
    // For now, we'll create a system notification that admins can query
    await Notification.create({
      recipient: null, // System-level notification
      type: 'EMERGENCY',
      title: `Emergency Request: ${request.requestId}`,
      message: `Hospital ${req.hospital.name} has created a critical emergency request for ${request.organType}. Patient: ${request.patient.name}`,
      relatedEntity: {
        id: request._id,
        model: 'Request'
      }
    });
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
  const transplants = await Transplant.find({ 'recipient.hospital': req.hospital.id })
    .populate('donor', 'personalInfo.firstName personalInfo.lastName')
    .populate('request', 'requestId patient.name organType')
    .sort({ surgeryDate: -1, createdAt: -1 });

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

// @desc    Capture delay reason on SLA breach
// @route   PUT /api/hospital/requests/:id/sla-breach
// @access  Private (Approved Hospital)
const captureSLABreach = asyncHandler(async (req, res) => {
  const { delayReason } = req.body;

  if (!delayReason) {
    throw new ErrorResponse('Delay reason is required', 400);
  }

  const request = await Request.findOne({
    _id: req.params.id,
    hospital: req.hospital.id
  });

  if (!request) {
    throw new ErrorResponse('Request not found', 404);
  }

  request.slaBreachedAt = new Date();
  request.delayReason = delayReason;

  // Update lifecycle
  request.lifecycle.push({
    stage: request.status,
    timestamp: new Date(),
    notes: `SLA breached. Reason: ${delayReason}`
  });

  await request.save();

  await Notification.create({
    recipient: req.hospital.id,
    type: 'SLA_WARNING',
    title: 'SLA Breach Recorded',
    message: `SLA breach recorded for request ${request.requestId}. Reason: ${delayReason}`,
    relatedEntity: {
      id: request._id,
      model: 'Request'
    }
  });

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Get Donor Timeline (Donor → Request → Transplant)
// @route   GET /api/hospital/donors/:id/timeline
// @access  Private (Approved Hospital)
const getDonorTimeline = asyncHandler(async (req, res) => {
  const donor = await Donor.findOne({
    _id: req.params.id,
    registeredHospital: req.hospital.id
  });

  if (!donor) {
    throw new ErrorResponse('Donor not found', 404);
  }

  // Get related requests
  const requests = await Request.find({
    matchedDonor: donor._id
  })
    .select('requestId patient.name organType status createdAt')
    .sort({ createdAt: -1 })
    .lean();

  // Get related transplants
  const transplants = await Transplant.find({
    donor: donor._id
  })
    .populate('request', 'requestId patient.name')
    .select('transplantId organType status surgeryDetails.scheduledDate outcome')
    .sort({ createdAt: -1 })
    .lean();

  const timeline = [
    {
      type: 'donor_registered',
      timestamp: donor.createdAt,
      title: 'Donor Registered',
      details: `${donor.personalInfo.firstName} ${donor.personalInfo.lastName} registered`,
      status: donor.status
    },
    ...requests.map(req => ({
      type: 'request_matched',
      timestamp: req.createdAt,
      title: 'Request Matched',
      details: `Matched to request ${req.requestId} for ${req.organType}`,
      status: req.status,
      requestId: req.requestId
    })),
    ...transplants.map(tx => ({
      type: 'transplant',
      timestamp: tx.surgeryDetails?.scheduledDate || tx.createdAt,
      title: 'Transplant Performed',
      details: `Transplant ${tx.transplantId} - ${tx.organType}`,
      status: tx.status,
      outcome: tx.outcome,
      transplantId: tx.transplantId
    }))
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.status(200).json({
    success: true,
    data: {
      donor: {
        id: donor._id,
        name: `${donor.personalInfo.firstName} ${donor.personalInfo.lastName}`,
        status: donor.status
      },
      timeline
    }
  });
});

// @desc    Update Transplant Outcome
// @route   PUT /api/hospital/transplants/:id/outcome
// @access  Private (Approved Hospital)
const updateTransplantOutcome = asyncHandler(async (req, res) => {
  const { success, complications, notes, followUpRequired } = req.body;

  let transplant = await Transplant.findOne({
    _id: req.params.id,
    'recipient.hospital': req.hospital.id
  });

  if (!transplant) {
    throw new ErrorResponse('Transplant record not found', 404);
  }

  transplant.outcome = {
    success: success !== undefined ? success : transplant.outcome?.success,
    complications: complications || transplant.outcome?.complications || [],
    notes: notes || transplant.outcome?.notes || '',
    followUpRequired: followUpRequired !== undefined ? followUpRequired : (transplant.outcome?.followUpRequired ?? true)
  };

  if (transplant.status !== 'completed') {
    transplant.status = 'completed';
  }

  await transplant.save();

  // Auto-calculate hospital success metrics
  const hospital = await Hospital.findById(req.hospital.id);
  const totalTransplants = await Transplant.countDocuments({
    'recipient.hospital': req.hospital.id,
    status: 'completed'
  });
  const successfulTransplants = await Transplant.countDocuments({
    'recipient.hospital': req.hospital.id,
    status: 'completed',
    'outcome.success': true
  });

  hospital.stats.successfulTransplants = successfulTransplants;
  hospital.stats.successRate = totalTransplants > 0
    ? Math.round((successfulTransplants / totalTransplants) * 100)
    : 0;
  await hospital.save();

  await AuditLog.create({
    actionType: 'UPDATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'TRANSPLANT',
    entityId: transplant._id,
    details: `Transplant outcome updated. Success: ${success}, Complications: ${complications?.length || 0}`
  });

  res.status(200).json({
    success: true,
    data: transplant
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

  // SLA Compliance
  const slaCompliance = await Request.aggregate([
    {
      $match: {
        hospital: new mongoose.Types.ObjectId(hospitalId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $project: {
        urgencyLevel: '$patient.urgencyLevel',
        createdAt: 1,
        slaBreachedAt: 1,
        status: 1,
        slaLimit: {
          $switch: {
            branches: [
              { case: { $eq: ['$patient.urgencyLevel', 'critical'] }, then: 24 },
              { case: { $eq: ['$patient.urgencyLevel', 'high'] }, then: 48 },
              { case: { $eq: ['$patient.urgencyLevel', 'medium'] }, then: 72 },
              { case: { $eq: ['$patient.urgencyLevel', 'low'] }, then: 168 }
            ],
            default: 72
          }
        }
      }
    },
    {
      $project: {
        urgencyLevel: 1,
        createdAt: 1,
        slaBreachedAt: 1,
        status: 1,
        slaLimit: 1,
        hoursElapsed: {
          $divide: [
            { $subtract: [new Date(), '$createdAt'] },
            1000 * 60 * 60
          ]
        },
        isBreached: { $ne: ['$slaBreachedAt', null] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        breached: { $sum: { $cond: ['$isBreached', 1, 0] } },
        compliant: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    }
  ]);

  // Success Rates
  const successRates = await Transplant.aggregate([
    {
      $match: {
        hospital: new mongoose.Types.ObjectId(hospitalId),
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$organType',
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: [{ $eq: ['$outcome.success', true] }, 1, 0] }
        }
      }
    }
  ]);

  // Donor Conversion
  const donorConversion = await Donor.aggregate([
    {
      $match: {
        registeredHospital: new mongoose.Types.ObjectId(hospitalId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'transplants',
        localField: '_id',
        foreignField: 'donor',
        as: 'transplants'
      }
    },
    {
      $project: {
        status: 1,
        hasTransplant: { $gt: [{ $size: '$transplants' }, 0] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        converted: { $sum: { $cond: ['$hasTransplant', 1, 0] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      slaCompliance: {
        total: sla.total,
        breached: sla.breached,
        compliant: sla.compliant,
        complianceRate: sla.total > 0
          ? Math.round(((sla.total - sla.breached) / sla.total) * 100)
          : 100
      },
      successRates: successRates.map(sr => ({
        organType: sr._id,
        total: sr.total,
        successful: sr.successful,
        successRate: Math.round((sr.successful / sr.total) * 100)
      })),
      donorConversion: {
        total: conversion.total,
        converted: conversion.converted,
        conversionRate: conversion.total > 0
          ? Math.round((conversion.converted / conversion.total) * 100)
          : 0
      },
      period: parseInt(period)
    }
  });
});

// @desc    Get Anonymized Public Donor Profiles (Discovery)
// @route   GET /api/hospital/donors/discovery
// @access  Private (Approved Hospital)
const getPublicDonors = asyncHandler(async (req, res) => {
  const { bloodType, organType } = req.query;

  let query = { status: 'active' };
  if (bloodType) query['medicalInfo.bloodType'] = bloodType;
  if (organType) query['donationPreferences.organTypes'] = organType;

  const donors = await Donor.find(query)
    .select('medicalInfo.bloodType donationPreferences.organTypes location.city location.state status createdAt');

  // Also include Users who are donors and have public visibility
  let userQuery = { isDonor: true, visibilityStatus: 'public', availabilityStatus: 'Active' };
  if (bloodType) userQuery.bloodType = bloodType;
  if (organType) userQuery.organ = organType;

  const userDonors = await User.find(userQuery).select('bloodType organ createdAt');

  const formattedUsers = userDonors.map(u => ({
    _id: u._id,
    medicalInfo: { bloodType: u.bloodType },
    donationPreferences: { organTypes: [u.organ] },
    source: 'user',
    createdAt: u.createdAt
  }));

  const formattedDonors = donors.map(d => ({
    ...d._doc,
    source: 'donor'
  }));

  res.status(200).json({
    success: true,
    data: [...formattedDonors, ...formattedUsers]
  });
});

// @desc    Validate Hospital Eligibility for a Match
// @route   PUT /api/hospital/requests/:id/validate-eligibility
// @access  Private (Approved Hospital)
const validateEligibility = asyncHandler(async (req, res) => {
  const request = await Request.findOne({
    _id: req.params.id,
    hospital: req.hospital.id,
    status: 'matched'
  });

  if (!request) {
    throw new ErrorResponse('Matched request not found', 404);
  }

  request.eligibilityStatus = 'validated';
  request.lifecycle.push({
    stage: 'eligibility_validated',
    timestamp: new Date(),
    notes: 'Hospital eligibility validated'
  });

  await request.save();

  res.status(200).json({
    success: true,
    message: 'Eligibility validated successfully',
    data: request
  });
});

// @desc    Get Detailed Donor Profile (Conditional Reveal)
// @route   GET /api/hospital/donors/:id/profile
// @access  Private (Approved Hospital)
const getDonorProfile = asyncHandler(async (req, res) => {
  const donorId = req.params.id;
  const hospitalId = req.hospital.id;

  // 1. Check if the hospital is the registering hospital (Full Reveal Always)
  let donor = await Donor.findById(donorId);

  if (donor && donor.registeredHospital && donor.registeredHospital.toString() === hospitalId.toString()) {
    return res.status(200).json({ success: true, data: donor, revealed: true });
  }

  // 2. Check for a confirmed match with Reveal conditions
  const request = await Request.findOne({
    matchedDonor: donorId,
    hospital: hospitalId,
    status: 'matched'
  });

  if (request) {
    const isRevealed = request.eligibilityStatus === 'validated' && request.consentStatus === 'given';

    if (isRevealed) {
      if (!request.confidentialDataRevealed) {
        request.confidentialDataRevealed = true;
        await request.save();

        // Log the first-time reveal access
        await AuditLog.create({
          actionType: 'CONFIDENTIAL_DATA_ACCESS',
          performedBy: { id: hospitalId, name: req.hospital.name, role: 'Hospital' },
          entityType: 'DONOR',
          entityId: donorId,
          details: `Sensitive data revealed for donor under request ${request.requestId}`
        });
      }

      const fullDonor = donor || await User.findById(donorId);
      return res.status(200).json({ success: true, data: fullDonor, revealed: true });
    }
  }

  // 3. Otherwise return Anonymized Data
  if (!donor) {
    const userDonor = await User.findById(donorId);
    if (!userDonor) throw new ErrorResponse('Donor not found', 404);

    return res.status(200).json({
      success: true,
      data: {
        medicalInfo: { bloodType: userDonor.bloodType },
        donationPreferences: { organTypes: [userDonor.organ] },
        status: userDonor.availabilityStatus
      },
      revealed: false
    });
  }

  res.status(200).json({
    success: true,
    data: {
      medicalInfo: { bloodType: donor.medicalInfo.bloodType },
      donationPreferences: donor.donationPreferences,
      location: { city: donor.location.city, state: donor.location.state },
      status: donor.status
    },
    revealed: false
  });
});



// @desc    Get all doctors for a hospital
// @route   GET /api/hospital/doctors
// @access  Private (Hospital)
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ hospital: req.hospital.id, active: true });

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// @desc    Add a new doctor
// @route   POST /api/hospital/doctors
// @access  Private (Hospital)
const addDoctor = asyncHandler(async (req, res) => {
  req.body.hospital = req.hospital.id;

  const doctor = await Doctor.create(req.body);

  await AuditLog.create({
    actionType: 'CREATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'DOCTOR',
    entityId: doctor._id,
    details: `Added new doctor: ${doctor.name}`
  });

  res.status(201).json({
    success: true,
    data: doctor
  });
});

// @desc    Update doctor profile
// @route   PUT /api/hospital/doctors/:id
// @access  Private (Hospital)
const updateDoctor = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findOne({ _id: req.params.id, hospital: req.hospital.id });

  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await AuditLog.create({
    actionType: 'UPDATE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'DOCTOR',
    entityId: doctor._id,
    details: `Updated doctor profile: ${doctor.name}`
  });

  res.status(200).json({
    success: true,
    data: doctor
  });
});

// @desc    Remove (Deactivate) doctor
// @route   DELETE /api/hospital/doctors/:id
// @access  Private (Hospital)
const removeDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, hospital: req.hospital.id });

  if (!doctor) {
    throw new ErrorResponse('Doctor not found', 404);
  }

  // Soft delete
  doctor.active = false;
  await doctor.save();

  await AuditLog.create({
    actionType: 'DELETE',
    performedBy: { id: req.hospital.id, name: req.hospital.name, role: 'Hospital' },
    entityType: 'DOCTOR',
    entityId: doctor._id,
    details: `Deactivated doctor record: ${doctor.name}`
  });

  res.status(200).json({
    success: true,
    message: 'Doctor record deactivated'
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
  captureSLABreach,
  getDonorTimeline,
  updateTransplantOutcome,
  getHospitalAnalytics,
  getPublicDonors,
  validateEligibility,
  getDonorProfile,
  getDoctors,
  addDoctor,
  updateDoctor,
  removeDoctor
};
