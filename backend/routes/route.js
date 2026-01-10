import express from 'express';

const router = express.Router();

// Health Check
router.get('/', (req, res) => {
    res.send('Server is running');
});

router.get('/api', (req, res) => {
    res.send('API is running...');
});

export default router;
