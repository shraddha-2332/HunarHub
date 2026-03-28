const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');
const ServiceRequest = require('../models/ServiceRequest');

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  location: user.location || '',
  address: user.address || '',
  bio: user.bio || '',
  skillType: user.skillType,
  skills: user.skills || [],
  experienceYears: user.experienceYears || 0,
  pricingDetails: user.pricingDetails || '',
  availability: user.availability || '',
  gallery: user.gallery || [],
  isVerified: Boolean(user.isVerified)
});

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      location,
      skillType,
      skills,
      bio,
      experienceYears,
      pricingDetails,
      availability
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const normalizedRole = role === 'entrepreneur' ? 'entrepreneur' : 'customer';
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      phone,
      location,
      skillType: normalizedRole === 'entrepreneur' ? skillType || 'other' : 'other',
      skills: Array.isArray(skills) ? skills : [],
      bio,
      experienceYears: experienceYears || 0,
      pricingDetails,
      availability
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: signToken(user),
      user: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Logged in successfully',
      token: signToken(user),
      user: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

exports.updateMe = async (req, res) => {
  try {
    const editableFields = [
      'name',
      'phone',
      'location',
      'address',
      'bio',
      'skillType',
      'skills',
      'experienceYears',
      'pricingDetails',
      'availability',
      'gallery'
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    await req.user.save();
    res.json({ message: 'Profile updated successfully', user: formatUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [entrepreneurs, customers, products, services, orders, serviceRequests] = await Promise.all([
        User.countDocuments({ role: 'entrepreneur' }),
        User.countDocuments({ role: 'customer' }),
        Product.countDocuments(),
        Service.countDocuments(),
        Order.countDocuments(),
        ServiceRequest.countDocuments()
      ]);

      return res.json({
        role: 'admin',
        summary: { entrepreneurs, customers, products, services, orders, serviceRequests }
      });
    }

    if (req.user.role === 'entrepreneur') {
      const [products, services, orders, requests] = await Promise.all([
        Product.countDocuments({ seller: req.user._id }),
        Service.countDocuments({ entrepreneur: req.user._id }),
        Order.find({ entrepreneur: req.user._id }).sort({ createdAt: -1 }).limit(10).populate('buyer', 'name'),
        ServiceRequest.find({ entrepreneur: req.user._id }).sort({ createdAt: -1 }).limit(10).populate('customer', 'name').populate('service', 'title')
      ]);

      const earnings = orders
        .filter((order) => order.status === 'accepted' || order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      return res.json({
        role: 'entrepreneur',
        summary: { products, services, earnings, orders: orders.length, requests: requests.length },
        recentOrders: orders,
        recentRequests: requests
      });
    }

    const [orders, requests] = await Promise.all([
      Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }).limit(10).populate('entrepreneur', 'name skillType'),
      ServiceRequest.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(10).populate('entrepreneur', 'name skillType').populate('service', 'title')
    ]);

    res.json({
      role: 'customer',
      summary: { orders: orders.length, requests: requests.length },
      recentOrders: orders,
      recentRequests: requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
