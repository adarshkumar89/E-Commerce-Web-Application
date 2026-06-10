const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  inStock: { type: Boolean, default: true },
  brand: String,
  rating: { type: Number, default: 4 }
});

module.exports = mongoose.model('Product', productSchema); 