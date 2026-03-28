const Product = require('../models/Product');
const Service = require('../models/Service');

const ensureEntrepreneur = (user) => user.role === 'entrepreneur' || user.role === 'admin';

exports.createProduct = async (req, res) => {
  try {
    if (!ensureEntrepreneur(req.user)) {
      return res.status(403).json({ message: 'Entrepreneur access required' });
    }

    const product = await Product.create({
      ...req.body,
      seller: req.user._id,
      location: req.body.location || req.user.location || ''
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    Object.assign(product, req.body);
    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    if (!ensureEntrepreneur(req.user)) {
      return res.status(403).json({ message: 'Entrepreneur access required' });
    }

    const service = await Service.create({
      ...req.body,
      entrepreneur: req.user._id,
      location: req.body.location || req.user.location || ''
    });

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (req.user.role !== 'admin' && String(service.entrepreneur) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    Object.assign(service, req.body);
    await service.save();
    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (req.user.role !== 'admin' && String(service.entrepreneur) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const [products, services] = await Promise.all([
      Product.find({ seller: req.user._id }).sort({ createdAt: -1 }),
      Service.find({ entrepreneur: req.user._id }).sort({ createdAt: -1 })
    ]);

    res.json({ products, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
