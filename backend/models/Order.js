const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    shippingAddress: { type: String, trim: true },
    paymentMethod: { type: String, trim: true, default: 'cash_on_delivery' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
