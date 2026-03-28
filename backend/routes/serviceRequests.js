const express = require('express');
const {
  createServiceRequest,
  getServiceRequests,
  updateServiceRequestStatus
} = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createServiceRequest);
router.get('/', getServiceRequests);
router.put('/:id', updateServiceRequestStatus);

module.exports = router;
