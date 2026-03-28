const express = require('express');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id', updateOrderStatus);

module.exports = router;
