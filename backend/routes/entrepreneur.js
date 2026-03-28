const express = require('express');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  createService,
  updateService,
  deleteService,
  getMyListings
} = require('../controllers/entrepreneurController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(requireRole('entrepreneur', 'admin'));

router.get('/listings', getMyListings);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

module.exports = router;
