const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
  try {
    const { entrepreneurId, productId, rating, comment, orderId, serviceRequestId } = req.body;
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      entrepreneur: entrepreneurId || undefined,
      product: productId || undefined,
      rating,
      comment,
      order: orderId || undefined,
      serviceRequest: serviceRequestId || undefined
    });

    if (productId) {
      const productReviews = await Review.find({ product: productId });
      const average = productReviews.reduce((sum, item) => sum + item.rating, 0) / productReviews.length;
      await Product.findByIdAndUpdate(productId, {
        rating: Number(average.toFixed(1)),
        reviewCount: productReviews.length
      });
    }

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.entrepreneurId) filter.entrepreneur = req.query.entrepreneurId;
    if (req.query.productId) filter.product = req.query.productId;

    const reviews = await Review.find(filter).populate('reviewer', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
