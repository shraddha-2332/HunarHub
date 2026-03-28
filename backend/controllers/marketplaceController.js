const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Review = require('../models/Review');

const applyRange = (query, field, min, max) => {
  if (min || max) {
    query[field] = {};
    if (min) query[field].$gte = Number(min);
    if (max) query[field].$lte = Number(max);
  }
};

exports.getEntrepreneurs = async (req, res) => {
  try {
    const { category, location, search, minPrice, maxPrice } = req.query;
    const filter = { role: 'entrepreneur' };

    if (category) filter.skillType = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    const entrepreneurs = await User.find(filter).select('-password').sort({ isVerified: -1, createdAt: -1 });

    const detailed = await Promise.all(
      entrepreneurs.map(async (entrepreneur) => {
        const [products, services, reviews] = await Promise.all([
          Product.find({ seller: entrepreneur._id, isActive: true }),
          Service.find({ entrepreneur: entrepreneur._id, isActive: true }),
          Review.find({ entrepreneur: entrepreneur._id })
        ]);

        const averageRating = reviews.length
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        const lowestPrice = [...products.map((item) => item.price), ...services.map((item) => item.price)]
          .filter((value) => value !== undefined)
          .sort((a, b) => a - b)[0];

        return {
          id: entrepreneur._id,
          name: entrepreneur.name,
          skillType: entrepreneur.skillType,
          location: entrepreneur.location || '',
          bio: entrepreneur.bio || '',
          skills: entrepreneur.skills || [],
          experienceYears: entrepreneur.experienceYears || 0,
          pricingDetails: entrepreneur.pricingDetails || '',
          availability: entrepreneur.availability || '',
          gallery: entrepreneur.gallery || [],
          isVerified: entrepreneur.isVerified,
          averageRating: Number(averageRating.toFixed(1)),
          reviewCount: reviews.length,
          lowestPrice: lowestPrice || 0,
          servicesCount: services.length,
          productsCount: products.length
        };
      })
    );

    const filtered = detailed.filter((item) => {
      if (minPrice && item.lowestPrice < Number(minPrice)) return false;
      if (maxPrice && item.lowestPrice > Number(maxPrice)) return false;
      return true;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntrepreneurById = async (req, res) => {
  try {
    const entrepreneur = await User.findOne({ _id: req.params.id, role: 'entrepreneur' }).select('-password');
    if (!entrepreneur) {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    const [products, services, reviews] = await Promise.all([
      Product.find({ seller: entrepreneur._id, isActive: true }),
      Service.find({ entrepreneur: entrepreneur._id, isActive: true }),
      Review.find({ entrepreneur: entrepreneur._id }).populate('reviewer', 'name')
    ]);

    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      profile: entrepreneur,
      products,
      services,
      reviews,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, location, search, minPrice, maxPrice, sellerId } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (sellerId) filter.seller = sellerId;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) filter.name = { $regex: search, $options: 'i' };
    applyRange(filter, 'price', minPrice, maxPrice);

    const products = await Product.find(filter).populate('seller', 'name skillType location isVerified');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name skillType location isVerified bio');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id }).populate('reviewer', 'name');
    res.json({ ...product.toObject(), reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const { category, location, search, minPrice, maxPrice, entrepreneurId } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (entrepreneurId) filter.entrepreneur = entrepreneurId;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) filter.title = { $regex: search, $options: 'i' };
    applyRange(filter, 'price', minPrice, maxPrice);

    const services = await Service.find(filter).populate('entrepreneur', 'name skillType location isVerified');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
