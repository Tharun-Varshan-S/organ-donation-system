import express from 'express';
import { adminRegister, adminLogin, getAdminProfile } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { authSchemas } from '../utils/validationSchemas.js';

const router = express.Router();

// @route   POST /api/admin/register
router.post('/register', validateRequest(authSchemas.adminRegister), adminRegister);

// @route   POST /api/admin/login
router.post('/login', validateRequest(authSchemas.adminLogin), adminLogin);

// @route   GET /api/admin/profile
router.get('/profile', protect, adminOnly, getAdminProfile);

export default router;

