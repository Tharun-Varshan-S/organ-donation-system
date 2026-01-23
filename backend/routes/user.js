import express from 'express';
import { userRegister, userLogin, getUserProfile, updateUserProfile, getUserHistory } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js'; // Assuming auth middleware exists

const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/history', protect, getUserHistory);

export default router;
