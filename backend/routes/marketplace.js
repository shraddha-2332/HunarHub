const express = require('express');
const {
  getEntrepreneurs,
  getEntrepreneurById,
  getProducts,
  getProductById,
  getServices
} = require('../controllers/marketplaceController');

const router = express.Router();

router.get('/entrepreneurs', getEntrepreneurs);
router.get('/entrepreneurs/:id', getEntrepreneurById);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/services', getServices);

module.exports = router;
