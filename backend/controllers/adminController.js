const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');

exports.getAnalytics = async (req, res) => {
  try {
    const [entrepreneurs, verifiedEntrepreneurs, activeUsers, orders, serviceRequests, products, reviews] = await Promise.all([
      User.countDocuments({ role: 'entrepreneur' }),
      User.countDocuments({ role: 'entrepreneur', isVerified: true }),
      User.countDocuments({ role: 'customer' }),
      Order.find(),
      ServiceRequest.find(),
      Product.countDocuments(),
      Review.find()
    ]);

    const productSalesVolume = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedRequests = serviceRequests.filter((item) => item.status === 'accepted' || item.status === 'completed').length;
    const serviceRequestConversionRate = serviceRequests.length
      ? Number(((completedRequests / serviceRequests.length) * 100).toFixed(1))
      : 0;
    const averageEntrepreneurEarnings = entrepreneurs
      ? Number((productSalesVolume / entrepreneurs).toFixed(1))
      : 0;
    const customerSatisfactionRatings = reviews.length
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : 0;

    res.json({
      numberOfRegisteredEntrepreneurs: entrepreneurs,
      verifiedEntrepreneurs,
      numberOfActiveUsers: activeUsers,
      serviceRequestConversionRate,
      productSalesVolume,
      averageEntrepreneurEarnings,
      customerSatisfactionRatings,
      totalProducts: products,
      totalOrders: orders.length,
      totalServiceRequests: serviceRequests.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntrepreneursForAdmin = async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' }).select('-password').sort({ createdAt: -1 });
    res.json(entrepreneurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEntrepreneur = async (req, res) => {
  try {
    const entrepreneur = await User.findOne({ _id: req.params.id, role: 'entrepreneur' });
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    entrepreneur.isVerified = Boolean(req.body.isVerified);
    await entrepreneur.save();
    res.json({ message: 'Verification status updated successfully', entrepreneur });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOperations = async (req, res) => {
  try {
    const [orders, serviceRequests] = await Promise.all([
      Order.find().populate('buyer', 'name').populate('entrepreneur', 'name').sort({ createdAt: -1 }),
      ServiceRequest.find().populate('customer', 'name').populate('entrepreneur', 'name').populate('service', 'title').sort({ createdAt: -1 })
    ]);

    res.json({ orders, serviceRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
