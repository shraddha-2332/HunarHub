const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    category: {
      type: String,
      enum: ['cobbler', 'potter', 'tailor', 'artisan', 'small_vendor', 'other'],
      default: 'other'
    },
    description: { type: String, trim: true },
    preferredDate: { type: Date },
    location: { type: String, trim: true },
    budget: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
