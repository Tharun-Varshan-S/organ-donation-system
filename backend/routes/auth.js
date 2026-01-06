const express = require('express');
const { adminRegister, adminLogin, getAdminProfile } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admin/register
router.post('/register', adminRegister);

// @route   POST /api/admin/login
router.post('/login', adminLogin);

// @route   GET /api/admin/profile
router.get('/profile', protect, adminOnly, getAdminProfile);

module.exports = router;