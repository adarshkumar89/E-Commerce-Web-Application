const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Wishlist routes
router.post('/wishlist', auth, addToWishlist);
router.delete('/wishlist/:productId', auth, removeFromWishlist);
router.get('/wishlist', auth, getWishlist);

module.exports = router; 