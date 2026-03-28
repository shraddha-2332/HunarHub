const express = require('express');
const {
  getAnalytics,
  getEntrepreneursForAdmin,
  verifyEntrepreneur,
  getOperations
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/analytics', getAnalytics);
router.get('/entrepreneurs', getEntrepreneursForAdmin);
router.put('/entrepreneurs/:id/verify', verifyEntrepreneur);
router.get('/operations', getOperations);

module.exports = router;
