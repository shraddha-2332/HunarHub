const express = require('express');
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, createReview);

module.exports = router;
