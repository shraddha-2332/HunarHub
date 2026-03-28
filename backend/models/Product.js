const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['cobbler', 'potter', 'tailor', 'artisan', 'small_vendor', 'other'],
      default: 'other'
    },
    location: { type: String, trim: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String, trim: true }],
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
