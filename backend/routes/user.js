import express from 'express';
import {
    userRegister,
    userLogin,
    getUserProfile,
    updateUserProfile,
    getUserHistory,
    provideConsent,
    getDonorConfidentialRequests,
    respondToConfidentialRequest,
    updateConfidentialData,
    getConfidentialData,
    getPendingMatchRequests
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js'; // Assuming auth middleware exists

const router = express.Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/history', protect, getUserHistory);
router.get('/pending-matches', protect, getPendingMatchRequests);
router.put('/consent/:requestId', protect, provideConsent);

// Confidential data routes
router.get('/:id/confidential-requests', protect, getDonorConfidentialRequests);
router.put('/confidential-requests/:requestId/respond', protect, respondToConfidentialRequest);
router.put('/confidential-data', protect, updateConfidentialData);
router.get('/confidential-data', protect, getConfidentialData);

export default router;

