const express = require('express');
const { register, login, getMe, updateMe, getDashboard } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
