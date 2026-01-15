const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Transplant = require('../models/Transplant');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Hospital Stats
    const totalHospitals = await Hospital.countDocuments();
    const approvedHospitals = await Hospital.countDocuments({ status: 'approved' });
    const pendingHospitals = await Hospital.countDocuments({ status: 'pending' });
    const suspendedHospitals = await Hospital.countDocuments({ status: 'suspended' });

    // 2. Donor Stats (Read-only count)
    const totalDonors = await Donor.countDocuments();

    // 3. Request Stats
    const totalRequests = await Request.countDocuments();
    const requestsToday = await Request.countDocuments({ createdAt: { $gte: today } });
    const requestsThisMonth = await Request.countDocuments({ createdAt: { $gte: firstDayOfMonth } });

    // 4. Transplant Stats
    const totalTransplants = await Transplant.countDocuments();
    const successfulTransplants = await Transplant.countDocuments({
      status: 'completed',
      'outcome.success': true
    });

    // 5. Monthly Stats for Line Chart
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

    // 6. Organ Demand Distribution for Bar Chart
    const organDistribution = await Request.aggregate([
      {
        $group: {
          _id: '$organType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 7. Recent Insight Panels
    const recentApprovedHospitals = await Hospital.find({ status: 'approved' })
      .sort({ approvedAt: -1 })
      .limit(5)
      .select('name location.city approvedAt');

    const recentCompletedTransplants = await Transplant.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('recipient.hospital', 'name')
      .populate('transportDetails.pickupHospital', 'name');

    // 8. SLA Breaches (Requests pending > 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const slaBreaches = await Request.countDocuments({
      status: 'pending',
      createdAt: { $lt: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          hospitals: { total: totalHospitals, approved: approvedHospitals, pending: pendingHospitals, suspended: suspendedHospitals },
          donors: { total: totalDonors },
          requests: { total: totalRequests, today: requestsToday, month: requestsThisMonth },
          transplants: { total: totalTransplants, successful: successfulTransplants }
        },
        charts: {
          monthlyTransplants,
          organDistribution
        },
        insights: {
          recentApprovedHospitals,
          recentCompletedTransplants,
          slaBreaches
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// @desc    Get all hospitals
// @route   GET /api/admin/hospitals
// @access  Private (Admin)
const getHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, state, specialization, emergency } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (state) query['location.state'] = state;
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

    res.status(200).json({
      success: true,
      data: {
        hospitals,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospitals'
    });
  }
};

// @desc    Get hospital statistics and groupings
// @route   GET /api/admin/hospitals/stats
// @access  Private (Admin)
const getHospitalStats = async (req, res) => {
  try {
    // 1. Overall Status Counts
    const statusCounts = await Hospital.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Region-wise (State) Counts
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

    // 3. Specialization-wise Counts
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

    // 4. Emergency Count
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

  } catch (error) {
    console.error('Get hospital stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital statistics'
    });
  }
};

// @desc    Get single hospital details
// @route   GET /api/admin/hospitals/:id
// @access  Private (Admin)
const getHospitalDetails = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('approvedBy', 'name email');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Get additional stats for hospital
    const donorCount = await Donor.countDocuments({ registeredHospital: hospital._id });
    const requestCount = await Request.countDocuments({ hospital: hospital._id });

    // Success Rate calculation
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

    // Activity Timeline (Hospitals + Requests + Transplants)
    const requests = await Request.find({ hospital: hospital._id }).sort({ createdAt: -1 }).limit(5);
    const transplants = await Transplant.find({
      $or: [
        { 'recipient.hospital': hospital._id },
        { 'transportDetails.pickupHospital': hospital._id }
      ]
    }).sort({ updatedAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        ...hospital._doc,
        stats,
        recentActivity: {
          requests,
          transplants
        }
      }
    });

  } catch (error) {
    console.error('Get hospital details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital details'
    });
  }
};

// @desc    Approve hospital
// @route   PUT /api/admin/hospitals/:id/approve
// @access  Private (Admin)
const approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    hospital.status = 'approved';
    hospital.approvedBy = req.admin.id;
    hospital.approvedAt = new Date();
    hospital.isActive = true; // Ensure active access enabled

    await hospital.save();

    // Log Audit
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

  } catch (error) {
    console.error('Approve hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving hospital'
    });
  }
};

// @desc    Reject hospital (Delete from DB)
// @route   PUT /api/admin/hospitals/:id/reject
// @access  Private (Admin)
const rejectHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // STRICT: Delete from DB
    hospital.status = 'rejected';
    if (req.body.reason) hospital.rejectionReason = req.body.reason;
    hospital.approvedBy = req.admin.id; // Track who rejected it
    hospital.approvedAt = new Date(); // Track when
    hospital.isActive = false;
    await hospital.save();

    // Log Audit
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

  } catch (error) {
    console.error('Reject hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting hospital'
    });
  }
};

// @desc    Get all donors
// @route   GET /api/admin/donors
// @access  Private (Admin)
const getDonors = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, bloodType } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (bloodType) query['medicalInfo.bloodType'] = bloodType;

    const donors = await Donor.find(query)
      .populate('registeredHospital', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Donor.countDocuments(query);

    // Get blood type distribution
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
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donors'
    });
  }
};

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, organType, urgency, hospitalId } = req.query;

    // Build query
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

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
};

// @desc    Get all transplants
// @route   GET /api/admin/transplants
// @access  Private (Admin)
const getTransplants = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, organType, hospitalId } = req.query;

    // Build query
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

    // Get stats for transplants
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

  } catch (error) {
    console.error('Get transplants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transplants'
    });
  }
};

// @desc    Update hospital status
// @route   PUT /api/admin/hospitals/:id/status
// @access  Private (Admin)
const updateHospitalStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['approved', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, pending, or suspended'
      });
    }

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
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

    // Log Audit
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

  } catch (error) {
    console.error('Update hospital status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating hospital status'
    });
  }
};

// @desc    Get donor analytics
// @route   GET /api/admin/analytics/donors
// @access  Private (Admin)
const getDonorAnalytics = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();

    // 1. By Blood Type
    const byBloodType = await Donor.aggregate([
      { $group: { _id: '$medicalInfo.bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. By Organ Type (Unwinding organTypes array)
    const byOrganType = await Donor.aggregate([
      { $unwind: '$donationPreferences.organTypes' },
      { $group: { _id: '$donationPreferences.organTypes', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3. By Hospital
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

    // 4. By Location (State)
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
  } catch (error) {
    console.error('Donor analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching donor analytics' });
  }
};

// @desc    Get hospital performance analytics
// @route   GET /api/admin/analytics/hospital-performance
// @access  Private (Admin)
const getHospitalPerformance = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching performance' });
  }
};

// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching audit logs' });
  }
};

// @desc    Get system-wide reports for analytics page
// @route   GET /api/admin/reports/system
// @access  Private (Admin)
const getSystemReports = async (req, res) => {
  try {
    // 1. Organ Demand vs Availability
    const demand = await Request.aggregate([
      { $group: { _id: '$organType', count: { $sum: 1 } } }
    ]);
    const availability = await Donor.aggregate([
      { $unwind: '$donationPreferences.organTypes' },
      { $group: { _id: '$donationPreferences.organTypes', count: { $sum: 1 } } }
    ]);

    // 2. Hospital Performance Comparison
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

    // 3. Regional Donor Availability
    const regionalDonors = await Donor.aggregate([
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Monthly Trends (Combined Requests and Transplants)
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
  } catch (error) {
    console.error('System reports error:', error);
    res.status(500).json({ success: false, message: 'Error fetching system reports' });
  }
};

module.exports = {
  getDashboardStats,
  getHospitals,
  getHospitalStats,
  getHospitalDetails,
  approveHospital,
  rejectHospital,
  updateHospitalStatus,
  getDonors,
  getDonorAnalytics,
  getRequests,
  getTransplants,
  getHospitalPerformance,
  getAuditLogs,
  getSystemReports
};