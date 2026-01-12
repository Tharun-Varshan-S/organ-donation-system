const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if admin
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) {
        req.user = admin;
        req.userType = 'admin';
        req.admin = admin; // Backward compatibility
        return next();
      }

      // Check if hospital
      const hospital = await Hospital.findById(decoded.id).select('-password');
      if (hospital) {
        // Double check status just in case (though login handles it)
        if (hospital.status === 'pending') {
          return res.status(403).json({ message: 'Account pending approval' });
        }
        req.user = hospital;
        req.userType = 'hospital';
        req.hospital = hospital;
        return next();
      }

      throw new Error('Not authorized');

    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

// Hospital only middleware
const hospitalOnly = (req, res, next) => {
  if (req.userType !== 'hospital') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Hospitals only.'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  hospitalOnly
};