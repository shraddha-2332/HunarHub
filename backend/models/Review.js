const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', reviewSchema);
