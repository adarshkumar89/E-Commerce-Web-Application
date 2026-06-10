const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    name: String
  }],
  totalAmount: Number,
  shippingFee: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  customerName: String,
  customerEmail: String,
  shippingAddress: String,
  paymentMethod: {
    type: String,
    enum: ['upi', 'card'],
    required: true
  },
  upiId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDate: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 