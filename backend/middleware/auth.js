import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';

// Protect routes - verify JWT token (Universal)
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try finding admin
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      if (!admin.isActive) {
        return res.status(401).json({ success: false, message: 'Admin account is deactivated.' });
      }
      req.user = admin;
      req.admin = admin;
      req.userType = 'admin';
      return next();
    }

    // Try finding hospital
    const hospital = await Hospital.findById(decoded.id).select('-password');
    if (hospital) {
      if (!hospital.isActive) {
        return res.status(401).json({ success: false, message: 'Hospital account is deactivated.' });
      }
      if (hospital.status !== 'approved') {
        return res.status(403).json({ success: false, message: `Hospital account is ${hospital.status}.` });
      }
      req.user = hospital;
      req.hospital = hospital;
      req.userType = 'hospital';
      return next();
    }

    return res.status(401).json({ success: false, message: 'Token is not valid. User not found.' });
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.userType === 'admin' || (req.admin && req.admin.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Hospital only access
const hospitalOnly = (req, res, next) => {
  if (req.userType === 'hospital' || req.hospital) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Hospital privileges required.'
    });
  }
};

// Keep protectHospital as alias for backward compatibility if needed
const protectHospital = protect;

export {
  protect,
  adminOnly,
  hospitalOnly,
  protectHospital
};