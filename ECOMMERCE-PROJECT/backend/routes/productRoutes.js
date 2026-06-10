const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isValidObjectId } = require('../utils/validation');
const Product = require('../models/Product');

// Get all products
router.get('/', productController.getAllProducts);

// Get single product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid product ID format',
        details: 'The provided product ID is not in the correct format.'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found',
        details: 'The requested product could not be found in the database.'
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Search products - must be after specific routes
router.get('/search', productController.searchProducts);

module.exports = router; 