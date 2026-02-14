import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import Transplant from '../models/Transplant.js';
import AuditLog from '../models/AuditLog.js';
import Admin from '../models/Admin.js';
import catchAsync from '../utils/catchAsync.js';
import { ErrorResponse } from '../middleware/error.js';
import { sendHospitalApprovalMail } from '../utils/emailHelper.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getDashboardStats = catchAsync(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Unified Overview Stats via Aggregation
  const hospitalStats = await Hospital.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        emergency: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: [{ $ifNull: ['$contactInfo.emergencyPhone', ''] }, ''] },
                  { $gt: [{ $ifNull: ['$capacity.availableBeds', 0] }, 0] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const donorStats = await Donor.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        deceased: { $sum: { $cond: [{ $eq: ['$status', 'deceased'] }, 1, 0] } },
        unavailable: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
      }
    }
  ]);

  const requestStats = await Request.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        today: { $sum: { $cond: [{ $gte: ['$createdAt', today] }, 1, 0] } },
        month: { $sum: { $cond: [{ $gte: ['$createdAt', firstDayOfMonth] }, 1, 0] } },
        slaBreaches: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$status', 'pending'] }, { $lt: ['$createdAt', sevenDaysAgo] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const transplantStats = await Transplant.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$outcome.success', true] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const h = hospitalStats[0] || { total: 0, approved: 0, pending: 0, emergency: 0 };
  const d = donorStats[0] || { total: 0, active: 0, deceased: 0, unavailable: 0 };
  const r = requestStats[0] || { total: 0, today: 0, month: 0, slaBreaches: 0 };
  const t = transplantStats[0] || { total: 0, successful: 0 };

  const successRate = t.total > 0 ? Math.round((t.successful / t.total) * 100) : 0;

  // Monthly Stats
  const currentYear = new Date().getFullYear();
  const monthlyTransplants = await Transplant.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Organ type distribution
  const organDistribution = await Request.aggregate([
    {
      $group: {
        _id: '$organType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Recent Insight Panels
  const recentApprovedHospitals = await Hospital.find({ status: 'approved' })
    .sort({ approvedAt: -1 })
    .limit(5)
    .select('name location.city approvedAt');

  const recentCompletedTransplants = await Transplant.find({ status: 'completed' })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('recipient.hospital', 'name')
    .populate('transportDetails.pickupHospital', 'name');

  res.status(200).json({
    success: true,
    data: {
      overview: {
        hospitals: { total: h.total, approved: h.approved, pending: h.pending, emergency: h.emergency },
        donors: { total: d.total, active: d.active, deceased: d.deceased, unavailable: d.unavailable },
        requests: { total: r.total, today: r.today, month: r.month, slaBreaches: r.slaBreaches },
        transplants: { total: t.total, successful: t.successful, successRate }
      },
      charts: {
        monthlyTransplants,
        organDistribution
      },
      insights: {
        recentApprovedHospitals,
        recentCompletedTransplants,
        slaBreaches: r.slaBreaches
      },
      lastUpdated: new Date()
    }
  });
});

// @desc    Get all hospitals
// @route   GET /api/admin/hospitals
// @access  Private (Admin)
export const getHospitals = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search, state, city, specialization, emergency } = req.query;

  // Build query
  let query = {};
  if (status) query.status = status;
  if (state) query['location.state'] = state;
  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (specialization) query.specializations = specialization;

  if (emergency === 'true') {
    query['contactInfo.emergencyPhone'] = { $exists: true, $ne: '' };
    query['capacity.availableBeds'] = { $gt: 0 };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { 'location.state': { $regex: search, $options: 'i' } },
      { specializations: { $regex: search, $options: 'i' } }
    ];
  }

  const hospitals = await Hospital.find(query)
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Hospital.countDocuments(query);

  const hospitalsWithStats = await Promise.all(hospitals.map(async (hospital) => {
    const donorCount = await Donor.countDocuments({ registeredHospital: hospital._id });
    const requestCount = await Request.countDocuments({ hospital: hospital._id });

    const transplantStats = await Transplant.aggregate([
      {
        $match: {
          $or: [
            { 'recipient.hospital': hospital._id },
            { 'transportDetails.pickupHospital': hospital._id }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$outcome.success', true] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const successRate = transplantStats[0]
      ? Math.round((transplantStats[0].successful / transplantStats[0].total) * 100)
      : 0;

    return {
      ...hospital._doc,
      quickStats: {
        donorCount,
        requestCount,
        successfulTransplants: transplantStats[0]?.successful || 0,
        successRate
      }
    };
  }));

  res.status(200).json({
    success: true,
    data: {
      hospitals: hospitalsWithStats,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get hospital statistics and groupings
// @route   GET /api/admin/hospitals/stats
// @access  Private (Admin)
export const getHospitalStats = catchAsync(async (req, res) => {
  const statusCounts = await Hospital.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const regionStats = await Hospital.aggregate([
    {
      $group: {
        _id: '$location.state',
        totalHospitals: { $sum: 1 },
        approvedHospitals: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        }
      }
    },
    { $sort: { totalHospitals: -1 } }
  ]);

  const specializationStats = await Hospital.aggregate([
    { $unwind: '$specializations' },
    {
      $group: {
        _id: '$specializations',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const emergencyCount = await Hospital.countDocuments({
    'contactInfo.emergencyPhone': { $exists: true, $ne: '' },
    'capacity.availableBeds': { $gt: 0 }
  });

  const totalCount = await Hospital.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      total: totalCount,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      regionStats,
      specializationStats,
      emergencyCount
    }
  });
});

// @desc    Get single hospital details
// @route   GET /api/admin/hospitals/:id
// @access  Private (Admin)
export const getHospitalDetails = catchAsync(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)
    .populate('approvedBy', 'name email');

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  const donorCount = await Donor.countDocuments({ registeredHospital: hospital._id });
  const requestCount = await Request.countDocuments({ hospital: hospital._id });

  const transplantStats = await Transplant.aggregate([
    {
      $match: {
        $or: [
          { 'recipient.hospital': hospital._id },
          { 'transportDetails.pickupHospital': hospital._id }
        ]
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $eq: ['$outcome.success', true] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const stats = {
    donorCount,
    requestCount,
    transplants: transplantStats[0] || { total: 0, successful: 0 },
    successRate: transplantStats[0] ? Math.round((transplantStats[0].successful / transplantStats[0].total) * 100) : 0
  };

  const requests = await Request.find({ hospital: hospital._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('requestId organType status patient.urgencyLevel createdAt updatedAt');

  const transplants = await Transplant.find({
    $or: [
      { 'recipient.hospital': hospital._id },
      { 'transportDetails.pickupHospital': hospital._id }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select('transplantId organType status outcome.success createdAt updatedAt');

  const statusHistory = await AuditLog.find({
    entityType: 'HOSPITAL',
    entityId: hospital._id
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('actionType performedBy details createdAt');

  const timeline = [
    {
      type: 'REGISTRATION',
      timestamp: hospital.createdAt,
      description: 'Hospital registered',
      status: 'info'
    },
    ...(hospital.approvedAt ? [{
      type: 'APPROVAL',
      timestamp: hospital.approvedAt,
      description: `Approved by ${hospital.approvedBy?.name || 'Admin'}`,
      status: 'success'
    }] : []),
    ...requests.map(req => ({
      type: 'REQUEST',
      timestamp: req.createdAt,
      description: `${req.organType} request (${req.status})`,
      urgency: req.patient?.urgencyLevel,
      status: req.status === 'completed' ? 'success' : 'pending',
      entityId: req._id
    })),
    ...transplants.map(t => ({
      type: 'TRANSPLANT',
      timestamp: t.updatedAt,
      description: `${t.organType} transplant ${t.outcome?.success ? 'successful' : 'completed'}`,
      status: t.outcome?.success ? 'success' : 'warning',
      entityId: t._id
    })),
    ...statusHistory.map(log => ({
      type: log.actionType,
      timestamp: log.createdAt,
      description: log.details,
      performedBy: log.performedBy?.name,
      status: log.actionType === 'SUSPEND' ? 'error' : 'info'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);

  const reviewStats = hospital.reviews && hospital.reviews.length > 0 ? {
    averageRating: (hospital.reviews.reduce((sum, r) => sum + r.rating, 0) / hospital.reviews.length).toFixed(1),
    totalReviews: hospital.reviews.length,
    verifiedCount: hospital.reviews.filter(r => r.verified).length,
    recentReviews: hospital.reviews.slice(-5).reverse()
  } : {
    averageRating: 0,
    totalReviews: 0,
    verifiedCount: 0,
    recentReviews: []
  };

  res.status(200).json({
    success: true,
    data: {
      ...hospital._doc,
      stats,
      timeline,
      reviewStats,
      requests,
      recentActivity: {
        requests: requests.slice(0, 5),
        transplants: transplants.slice(0, 5)
      }
    }
  });
});

// @desc    Approve hospital
// @route   PUT /api/admin/hospitals/:id/approve
// @access  Private (Admin)
export const approveHospital = catchAsync(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  hospital.status = 'approved';
  hospital.approvedBy = req.admin.id;
  hospital.approvedAt = new Date();
  hospital.isActive = true;

  await hospital.save();

  await AuditLog.create({
    actionType: 'APPROVE',
    performedBy: {
      id: req.admin.id,
      name: req.admin.name,
      role: 'Admin'
    },
    entityType: 'HOSPITAL',
    entityId: hospital._id,
    details: 'Hospital approved'
  });

  res.status(200).json({
    success: true,
    message: 'Hospital approved successfully',
    data: hospital
  });

  // Background email sending
  sendHospitalApprovalMail(hospital.email, hospital.name).catch(console.error);
});


// @desc    Suspend hospital
// @route   PUT /api/admin/hospitals/:id/suspend
// @access  Private (Admin)
export const suspendHospital = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  hospital.status = 'suspended';
  hospital.isActive = false;
  if (reason) hospital.suspensionReason = reason;

  await hospital.save();

  await AuditLog.create({
    actionType: 'SUSPEND',
    performedBy: {
      id: req.admin.id,
      name: req.admin.name,
      role: 'Admin'
    },
    entityType: 'HOSPITAL',
    entityId: hospital._id,
    details: `Hospital suspended. Reason: ${reason || 'Not specified'}`
  });

  res.status(200).json({
    success: true,
    message: 'Hospital suspended successfully',
    data: hospital
  });
});

// @desc    Reject hospital
// @route   PUT /api/admin/hospitals/:id/reject
// @access  Private (Admin)
export const rejectHospital = catchAsync(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  hospital.status = 'rejected';
  if (req.body.reason) hospital.rejectionReason = req.body.reason;
  hospital.approvedBy = req.admin.id;
  hospital.approvedAt = new Date();
  hospital.isActive = false;
  await hospital.save();

  await AuditLog.create({
    actionType: 'REJECT',
    performedBy: {
      id: req.admin.id,
      name: req.admin.name,
      role: 'Admin'
    },
    entityType: 'HOSPITAL',
    entityId: hospital._id,
    details: 'Hospital rejected'
  });

  res.status(200).json({
    success: true,
    message: 'Hospital rejected and removed from system',
    data: {}
  });
});

// @desc    Get all donors
// @route   GET /api/admin/donors
// @access  Private (Admin)
export const getDonors = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, bloodType } = req.query;

  let query = {};
  if (status) query.status = status;
  if (bloodType) query['medicalInfo.bloodType'] = bloodType;

  const donors = await Donor.find(query)
    .populate('registeredHospital', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Donor.countDocuments(query);

  const bloodTypeStats = await Donor.aggregate([
    {
      $group: {
        _id: '$medicalInfo.bloodType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      donors,
      bloodTypeStats,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
export const getRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, organType, urgency, hospitalId } = req.query;

  let query = {};
  if (status) query.status = status;
  if (organType) query.organType = organType;
  if (urgency) query['patient.urgencyLevel'] = urgency;
  if (hospitalId) query.hospital = hospitalId;

  const requests = await Request.find(query)
    .populate('hospital', 'name location.city location.state licenseNumber')
    .populate('matchedDonor', 'personalInfo medicalInfo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Request.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      requests,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get all transplants
// @route   GET /api/admin/transplants
// @access  Private (Admin)
export const getTransplants = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, organType, hospitalId } = req.query;

  let query = {};
  if (status) query.status = status;
  if (organType) query.organType = organType;
  if (hospitalId) {
    query.$or = [
      { 'recipient.hospital': hospitalId },
      { 'transportDetails.pickupHospital': hospitalId },
      { 'transportDetails.deliveryHospital': hospitalId }
    ];
  }

  const transplants = await Transplant.find(query)
    .populate('request', 'requestId patient.name patient.bloodType createdAt')
    .populate('donor', 'personalInfo medicalInfo location')
    .populate('recipient.hospital', 'name location')
    .populate('transportDetails.pickupHospital', 'name location')
    .populate('transportDetails.deliveryHospital', 'name location')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Transplant.countDocuments(query);

  const stats = await Transplant.aggregate([
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        successfulCount: {
          $sum: { $cond: [{ $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$outcome.success', true] }] }, 1, 0] }
        },
        avgDuration: { $avg: '$surgeryDetails.duration' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      transplants,
      stats: stats[0] || { totalCount: 0, successfulCount: 0, avgDuration: 0 },
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Update hospital status
// @route   PUT /api/admin/hospitals/:id/status
// @access  Private (Admin)
export const updateHospitalStatus = catchAsync(async (req, res) => {
  const { status, reason } = req.body;

  if (!['approved', 'pending', 'suspended'].includes(status)) {
    throw new ErrorResponse('Invalid status. Must be approved, pending, or suspended', 400);
  }

  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    throw new ErrorResponse('Hospital not found', 404);
  }

  hospital.status = status;

  if (status === 'approved') {
    hospital.approvedBy = req.admin.id;
    hospital.approvedAt = new Date();
    hospital.isActive = true;
  } else if (status === 'suspended') {
    hospital.isActive = false;
    if (reason) hospital.suspensionReason = reason;
  } else {
    hospital.isActive = false;
  }

  await hospital.save();

  await AuditLog.create({
    actionType: status === 'suspended' ? 'SUSPEND' : 'UPDATE',
    performedBy: {
      id: req.admin.id,
      name: req.admin.name,
      role: 'Admin'
    },
    entityType: 'HOSPITAL',
    entityId: hospital._id,
    details: `Hospital status updated to ${status}`
  });

  res.status(200).json({
    success: true,
    message: `Hospital ${status} successfully`,
    data: hospital
  });

  // Background email sending if approved
  if (status === 'approved') {
    sendHospitalApprovalMail(hospital.email, hospital.name).catch(console.error);
  }
});


// @desc    Get donor analytics
// @route   GET /api/admin/analytics/donors
// @access  Private (Admin)
export const getDonorAnalytics = catchAsync(async (req, res) => {
  const totalDonors = await Donor.countDocuments();

  const byBloodType = await Donor.aggregate([
    { $group: { _id: '$medicalInfo.bloodType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const byOrganType = await Donor.aggregate([
    { $unwind: '$donationPreferences.organTypes' },
    { $group: { _id: '$donationPreferences.organTypes', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const byHospital = await Donor.aggregate([
    {
      $lookup: {
        from: 'hospitals',
        localField: 'registeredHospital',
        foreignField: '_id',
        as: 'hospital'
      }
    },
    { $unwind: { path: '$hospital', preserveNullAndEmptyArrays: true } },
    { $group: { _id: { $ifNull: ['$hospital.name', 'Unassigned'] }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const byLocation = await Donor.aggregate([
    { $group: { _id: '$location.state', count: { $sum: 1 } } },
    { $match: { _id: { $ne: null } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalDonors,
      byBloodType,
      byOrganType,
      byHospital,
      byLocation
    }
  });
});

// @desc    Get hospital performance analytics
// @route   GET /api/admin/analytics/hospital-performance
// @access  Private (Admin)
export const getHospitalPerformance = catchAsync(async (req, res) => {
  const performance = await Hospital.aggregate([
    { $match: { status: 'approved' } },
    {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'hospital',
        as: 'requests'
      }
    },
    {
      $project: {
        name: 1,
        totalRequests: { $size: '$requests' },
        completedRequests: {
          $size: {
            $filter: {
              input: '$requests',
              as: 'req',
              cond: { $eq: ['$$req.status', 'completed'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        successRate: {
          $cond: [
            { $eq: ['$totalRequests', 0] },
            0,
            { $multiply: [{ $divide: ['$completedRequests', '$totalRequests'] }, 100] }
          ]
        }
      }
    },
    { $sort: { successRate: -1 } },
    { $limit: 20 }
  ]);

  res.status(200).json({
    success: true,
    data: performance
  });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit
// @access  Private (Admin)
export const getAuditLogs = catchAsync(async (req, res) => {
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    data: logs
  });
});

// @desc    Get system-wide reports for analytics page
// @route   GET /api/admin/reports/system
// @access  Private (Admin)
export const getSystemReports = catchAsync(async (req, res) => {
  const demand = await Request.aggregate([
    { $group: { _id: '$organType', count: { $sum: 1 } } }
  ]);
  const availability = await Donor.aggregate([
    { $unwind: '$donationPreferences.organTypes' },
    { $group: { _id: '$donationPreferences.organTypes', count: { $sum: 1 } } }
  ]);

  const hospitalPerformance = await Hospital.aggregate([
    { $match: { status: 'approved' } },
    {
      $lookup: {
        from: 'transplants',
        let: { hospitalId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$recipient.hospital', '$$hospitalId'] },
                  { $eq: ['$transportDetails.pickupHospital', '$$hospitalId'] }
                ]
              }
            }
          }
        ],
        as: 'transplants'
      }
    },
    {
      $project: {
        name: 1,
        totalTransplants: { $size: '$transplants' },
        successfulTransplants: {
          $size: {
            $filter: {
              input: '$transplants',
              as: 't',
              cond: { $and: [{ $eq: ['$$t.status', 'completed'] }, { $eq: ['$$t.outcome.success', true] }] }
            }
          }
        }
      }
    },
    { $sort: { totalTransplants: -1 } },
    { $limit: 10 }
  ]);

  const regionalDonors = await Donor.aggregate([
    { $group: { _id: '$location.state', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const currentYear = new Date().getFullYear();
  const monthlyTrends = await Request.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        requests: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      organComparison: { demand, availability },
      hospitalPerformance,
      regionalDonors,
      monthlyTrends
    }
  });
});

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSettings = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('settings');
  res.status(200).json({ success: true, data: admin.settings });
});

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSettings = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  admin.settings = { ...admin.settings, ...req.body };
  await admin.save();
  res.status(200).json({ success: true, data: admin.settings });
});
