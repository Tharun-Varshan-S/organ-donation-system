import express from 'express';

const router = express.Router();

// Health Check
router.get('/', (req, res) => {
    res.redirect('/home');
});
router.get('/login', (req, res) => {
    res.redirect('/login');
});
router.get('/register', (req, res) => {
    res.redirect('/register');
});
router.get('/donor', (req, res) => {
    res.redirect('/donor');
});
router.get('/hospital', (req, res) => {
    res.redirect('/hospital');
});
router.get('/mission', (req, res) => {
    res.redirect('/mission');
});
router.get('/contact', (req, res) => {
    res.redirect('/contact');
}); 
router.get('/api', (req, res) => {
    res.send('API is running...');
});
export default router;
