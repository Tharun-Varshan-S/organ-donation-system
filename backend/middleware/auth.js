const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');

// Admin authentication
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Hospital authentication
const hospitalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hospital = await Hospital.findById(decoded.id);
    
    if (!hospital || hospital.status !== 'approved') {
      return res.status(401).json({ message: 'Invalid token or not approved' });
    }

    req.hospital = hospital;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { adminAuth, hospitalAuth };