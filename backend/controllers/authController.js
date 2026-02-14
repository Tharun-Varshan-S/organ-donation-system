import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';
import Application from '../models/Application.js';
import Transplant from '../models/Transplant.js';
import catchAsync from '../utils/catchAsync.js';
import { ErrorResponse } from '../middleware/error.js';
import { sendWelcomeMail, sendHospitalWelcomeMail } from '../utils/emailHelper.js';

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
export const adminRegister = catchAsync(async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (!name || !email || !password || !secretKey) {
    throw new ErrorResponse('Please provide all fields', 400);
  }

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    throw new ErrorResponse('Invalid admin secret key', 401);
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ErrorResponse('Admin already exists', 400);
  }

  const admin = await Admin.create({ name, email, password });
  const token = generateToken(admin._id, 'admin');

  res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    token,
    data: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
  });
});

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !await admin.comparePassword(password)) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  if (!admin.isActive) {
    throw new ErrorResponse('Admin account deactivated', 401);
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
});

export const getAdminProfile = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password');
  res.status(200).json({ success: true, data: admin });
});

// ==========================================
// HOSPITAL AUTH
// ==========================================

// @desc    Hospital Registration
// @route   POST /api/hospital/register
// @access  Public
export const hospitalRegister = catchAsync(async (req, res) => {
  const { name, email, password, licenseNumber, address, city, state, zipCode, phone, specializations } = req.body;

  const existingHospital = await Hospital.findOne({ $or: [{ email }, { licenseNumber }] });
  if (existingHospital) {
    throw new ErrorResponse('Hospital already exists (Email or License)', 400);
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

  // Background email sending
  sendHospitalWelcomeMail(hospital.email, hospital.name).catch(console.error);
});


// @desc    Hospital Login
// @route   POST /api/hospital/login
// @access  Public
export const hospitalLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  const hospital = await Hospital.findOne({ email }).select('+password');

  if (!hospital || !await hospital.comparePassword(password)) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // STRICT STATUS CHECKS
  if (hospital.status === 'pending') {
    throw new ErrorResponse('Your registration is under review', 403);
  }
  if (hospital.status === 'rejected') {
    throw new ErrorResponse(`Registration rejected. Reason: ${hospital.rejectionReason || 'Not specified'}`, 403);
  }
  if (hospital.status === 'suspended') {
    throw new ErrorResponse('Account suspended.', 403);
  }
  if (hospital.status !== 'approved') {
    throw new ErrorResponse('Access denied.', 403);
  }

  const token = generateToken(hospital._id, 'hospital');
  hospital.lastLogin = Date.now();
  await hospital.save();

  res.status(200).json({
    success: true,
    token,
    hospital: { id: hospital._id, name: hospital.name, email: hospital.email, status: hospital.status, role: 'hospital' }
  });
});

// @desc    Get all APPROVED hospitals (Public)
export const getPublicHospitals = catchAsync(async (req, res) => {
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
});

// @desc    Get single hospital details (Public)
export const getPublicHospitalById = catchAsync(async (req, res) => {
  const hospital = await Hospital.findOne({
    _id: req.params.id,
    status: 'approved'
  }).select('-password -licenseNumber -approvedBy -approvedAt');

  if (!hospital) {
    throw new ErrorResponse('Hospital not found or not approved', 404);
  }

  res.status(200).json({ success: true, data: hospital });
});

// ==========================================
// USER AUTH
// ==========================================

// @desc    User Registration
// @route   POST /api/users/register
// @access  Public
export const userRegister = catchAsync(async (req, res) => {
  const { name, email, password, bloodType, isDonor } = req.body;

  if (!name || !email || !password) {
    throw new ErrorResponse('Please provide name, email, and password', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse('User already exists', 400);
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

  // Background email sending
  sendWelcomeMail(user.email, user.name).catch(console.error);
});


// @desc    User Login
// @route   POST /api/users/login
// @access  Public
export const userLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !await user.matchPassword(password)) {
    throw new ErrorResponse('Invalid credentials', 401);
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
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
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
});

// @desc    Get user donation history
// @route   GET /api/users/history
// @access  Private
export const getUserHistory = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('donations');
  res.status(200).json({ success: true, data: user.donations || [] });
});

// @desc    Get Pending Match Requests for Donor
// @route   GET /api/users/pending-matches
// @access  Private (User/Donor)
export const getPendingMatchRequests = catchAsync(async (req, res) => {
  // Find consents for this user with pending status
  const pendingConsents = await Consent.find({
    user: req.user.id,
    status: 'pending'
  }).populate({
    path: 'request',
    select: 'requestId patient.age patient.gender patient.medicalCondition organType hospital',
    populate: {
      path: 'hospital',
      select: 'name location'
    }
  });

  res.status(200).json({
    success: true,
    count: pendingConsents.length,
    data: pendingConsents.map(c => ({
      consentId: c._id,
      request: c.request,
      requestedAt: c.createdAt
    }))
  });
});

// @desc    Provide Donor Consent for a Match
// @route   PUT /api/users/consent/:requestId
// @access  Private (Donor/User)
export const provideConsent = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { consent, rejectionReason } = req.body; // 'approved' or 'rejected'

  // Normalize input
  const status = consent === 'given' ? 'approved' : (consent === 'denied' ? 'rejected' : consent);

  if (!['approved', 'rejected'].includes(status)) {
    throw new ErrorResponse('Invalid consent value. Use approved or rejected.', 400);
  }

  if (status === 'rejected' && !rejectionReason) {
    throw new ErrorResponse('Rejection reason is mandatory.', 400);
  }

  // Find the Consent record
  const consentRecord = await Consent.findOne({
    request: requestId,
    user: req.user.id,
    status: 'pending'
  });

  if (!consentRecord) {
    throw new ErrorResponse('Pending consent record not found', 404);
  }

  const request = await Request.findById(requestId);
  if (!request) {
    throw new ErrorResponse('Request not found', 404);
  }

  // Update Consent Record
  consentRecord.status = status;
  consentRecord.respondedAt = new Date();
  if (status === 'rejected') {
    consentRecord.rejectionReason = rejectionReason;
  }
  await consentRecord.save();

  // Update Request
  request.consentStatus = status === 'approved' ? 'given' : 'denied';
  request.lifecycle.push({
    stage: status === 'approved' ? 'consent_given' : 'matched', // If denied, maybe revert or just log
    timestamp: new Date(),
    notes: `Donor consent ${status}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`
  });

  // AUTOMATIC APPLICATION CREATION (Enhancement)
  if (status === 'approved') {
    const existingApp = await Application.findOne({
      request: request._id,
      user: req.user.id
    });

    if (!existingApp) {
      await Application.create({
        request: request._id,
        type: "APPLICATION",
        status: "APPROVED",
        relatedEntity: {
          model: "Donor",
          id: req.user.id
        },
        user: req.user.id,
        consentSigned: true
      });
    } else {
      // Ensure existing app is visible
      if (existingApp.status !== 'APPROVED') {
        existingApp.status = 'APPROVED';
      }
      existingApp.consentSigned = true;
      // Ensure type and relatedEntity are set correctly if they were missing (migration fix)
      if (!existingApp.type) existingApp.type = "APPLICATION";
      if (!existingApp.relatedEntity || !existingApp.relatedEntity.id) {
        existingApp.relatedEntity = { model: "Donor", id: req.user.id };
      }
      await existingApp.save();
    }
  }

  await request.save();

  await AuditLog.create({
    actionType: 'CONSENT_RECORD',
    performedBy: { id: req.user.id, name: req.user.name, role: 'User' },
    entityType: 'CONSENT',
    entityId: consentRecord._id,
    details: `Consent ${status} by donor for request ${request.requestId}`
  });

  res.status(200).json({
    success: true,
    message: `Consent successfully ${status}`,
    data: request
  });
});

// @desc    Get donor's confidential data requests
// @route   GET /api/users/:id/confidential-requests
// @access  Private (Donor/User)
export const getDonorConfidentialRequests = catchAsync(async (req, res) => {
  const donorId = req.params.id;
  if (req.user.id !== donorId) {
    throw new ErrorResponse('Unauthorized', 403);
  }

  const donor = await User.findById(donorId).populate('consentRequests.hospitalId', 'name');

  if (!donor) {
    throw new ErrorResponse('Donor not found', 404);
  }

  const requests = donor.consentRequests.map(req => ({
    _id: req._id,
    hospitalId: req.hospitalId._id,
    hospitalName: req.hospitalId.name,
    status: req.status,
    requestedAt: req.requestedAt,
    respondedAt: req.respondedAt,
  }));

  res.status(200).json({ success: true, data: requests });
});

// @desc    Respond to a confidential data request
// @route   PUT /api/users/confidential-requests/:requestId/respond
// @access  Private (Donor/User)
export const respondToConfidentialRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(status)) {
    throw new ErrorResponse('Invalid status value', 400);
  }

  const donor = await User.findOne({ _id: req.user.id });

  if (!donor) {
    throw new ErrorResponse('Donor not found', 404);
  }

  const consentRequest = donor.consentRequests.id(requestId);

  if (!consentRequest) {
    throw new ErrorResponse('Confidential data request not found', 404);
  }

  if (consentRequest.status !== 'pending') {
    throw new ErrorResponse('Request already responded to', 400);
  }

  consentRequest.status = status;
  consentRequest.respondedAt = new Date();

  await donor.save();

  await AuditLog.create({
    actionType: 'RESPOND_CONFIDENTIAL_DATA_REQUEST',
    performedBy: { id: req.user.id, name: req.user.name, role: 'User' },
    entityType: 'CONSENT_REQUEST',
    entityId: requestId,
    details: `Donor ${req.user.name} ${status} confidential data request from ${consentRequest.hospitalId}`,
  });

  res.status(200).json({
    success: true,
    message: `Request ${status} successfully`,
    data: consentRequest,
  });
});

// @desc    Update donor's confidential data
// @route   PUT /api/users/confidential-data
// @access  Private (Donor/User)
export const updateConfidentialData = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Initialize confidentialData if it doesn't exist
  if (!user.confidentialData) {
    user.confidentialData = {
      pii: {},
      contactInfo: {},
      detailedMedicalRecords: {},
      labReports: {}
    };
  }

  // Update confidential data fields
  if (req.body.confidentialData) {
    const { pii, contactInfo, detailedMedicalRecords, labReports } = req.body.confidentialData;

    if (pii) {
      user.confidentialData.pii = {
        ...user.confidentialData.pii,
        ...pii
      };
    }

    if (contactInfo) {
      user.confidentialData.contactInfo = {
        ...user.confidentialData.contactInfo,
        ...contactInfo
      };
    }

    if (detailedMedicalRecords) {
      user.confidentialData.detailedMedicalRecords = {
        ...user.confidentialData.detailedMedicalRecords,
        ...detailedMedicalRecords
      };
    }

    if (labReports) {
      user.confidentialData.labReports = {
        ...user.confidentialData.labReports,
        ...labReports
      };
    }
  }

  await user.save();

  await AuditLog.create({
    actionType: 'UPDATE_CONFIDENTIAL_DATA',
    performedBy: { id: req.user.id, name: req.user.name, role: 'User' },
    entityType: 'USER',
    entityId: user._id,
    details: `User ${req.user.name} updated confidential medical data`,
  });

  res.status(200).json({
    success: true,
    message: 'Confidential data updated successfully',
    data: user.confidentialData
  });
});

// @desc    Get donor's confidential data
// @route   GET /api/users/confidential-data
// @access  Private (Donor/User)
export const getConfidentialData = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('confidentialData');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user.confidentialData || {}
  });
});


// @desc    Get Annual Recipient Summary
// @route   GET /api/users/recipient-summary
// @access  Private (Donor/User)
export const getRecipientSummary = catchAsync(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  const matchStage = {
    status: 'completed',
    $or: [
      { 'surgeryDetails.actualDate': { $gte: startDate, $lte: endDate } },
      { surgeryDate: { $gte: startDate, $lte: endDate } } // Fallback
    ]
  };

  const summary = await Transplant.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        byOrgan: [
          { $group: { _id: '$organType', count: { $sum: 1 } } }
        ],
        byMonth: [
          {
            $group: {
              _id: { $month: { $ifNull: ['$surgeryDetails.actualDate', '$surgeryDate'] } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  const result = {
    year,
    total: summary[0].totalCount[0] ? summary[0].totalCount[0].count : 0,
    byOrgan: summary[0].byOrgan.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    byMonth: summary[0].byMonth.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
  };

  res.status(200).json({
    success: true,
    data: result
  });
});
