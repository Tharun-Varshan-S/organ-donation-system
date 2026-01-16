import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import Transplant from '../models/Transplant.js';
import AuditLog from '../models/AuditLog.js';


// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalHospitals = await Hospital.countDocuments();
    const approvedHospitals = await Hospital.countDocuments({ status: 'approved' });
    const pendingHospitals = await Hospital.countDocuments({ status: 'pending' });

    const totalDonors = await Donor.countDocuments();
    const activeDonors = await Donor.countDocuments({ status: 'active' });

    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });

    const totalTransplants = await Transplant.countDocuments();
    const successfulTransplants = await Transplant.countDocuments({
      status: 'completed',
      'outcome.success': true
    });

    // Get monthly stats for current year
    const currentYear = new Date().getFullYear();
    const monthlyTransplants = await Transplant.aggregate([
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
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get organ type distribution
    const organDistribution = await Request.aggregate([
      {
        $group: {
          _id: '$organType',
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
        overview: {
          totalHospitals,
          approvedHospitals,
          pendingHospitals,
          totalDonors,
          activeDonors,
          totalRequests,
          pendingRequests,
          totalTransplants,
          successfulTransplants
        },
        charts: {
          monthlyTransplants,
          organDistribution
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
    const { page = 1, limit = 10, status, search } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
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
          current: page,
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

// @desc    Suspend hospital
// @route   PUT /api/admin/hospitals/:id/suspend
// @access  Private (Admin)
const suspendHospital = async (req, res) => {
  try {
    const { reason } = req.body;

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    hospital.status = 'suspended';
    hospital.isActive = false;
    if (reason) hospital.suspensionReason = reason;

    await hospital.save();

    // Log Audit
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

  } catch (error) {
    console.error('Suspend hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Error suspending hospital'
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
    const { page = 1, limit = 10, status, organType, urgency } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (organType) query.organType = organType;
    if (urgency) query['patient.urgencyLevel'] = urgency;

    const requests = await Request.find(query)
      .populate('hospital', 'name location.city')
      .populate('matchedDonor', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          current: page,
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
    const { page = 1, limit = 10, status, organType } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (organType) query.organType = organType;

    const transplants = await Transplant.find(query)
      .populate('request', 'requestId patient.name')
      .populate('donor', 'personalInfo.firstName personalInfo.lastName')
      .populate('recipient.hospital', 'name')
      .populate('transportDetails.pickupHospital', 'name')
      .populate('transportDetails.deliveryHospital', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transplant.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transplants,
        pagination: {
          current: page,
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
    const { status } = req.body;

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

    const byBloodType = await Donor.aggregate([
      { $group: { _id: '$medicalInfo.bloodType', count: { $sum: 1 } } },
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
      { $unwind: '$hospital' },
      { $group: { _id: '$hospital.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const byLocation = await Donor.aggregate([
      { $group: { _id: '$personalInfo.address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDonors,
        byBloodType,
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

// @desc    Get audit logs
// @route   GET /api/admin/audit
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


export {
  getDashboardStats,
  getHospitals,
  getHospitalStats,
  getHospitalDetails,
  approveHospital,
  rejectHospital,
  suspendHospital,
  updateHospitalStatus,
  getDonors,
  getDonorAnalytics,
  getRequests,
  getTransplants,
  getHospitalPerformance,
  getAuditLogs
};
