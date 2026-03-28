const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['cobbler', 'potter', 'tailor', 'artisan', 'small_vendor', 'other'],
      default: 'other'
    },
    location: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, trim: true, default: 'per service' },
    availability: { type: String, trim: true, default: 'Available on request' },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Service', serviceSchema);
