import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import Request from '../models/Request.js';
import Transplant from '../models/Transplant.js';

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

export {
  getDashboardStats,
  getHospitals,
  approveHospital,
  suspendHospital,
  updateHospitalStatus,
  getDonors,
  getRequests,
  getTransplants
};