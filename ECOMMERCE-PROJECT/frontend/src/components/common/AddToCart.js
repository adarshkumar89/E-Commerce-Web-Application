import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './AddToCart.css';

const AddToCart = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    try {
      console.log('Adding to cart:', { product, quantity });
      if (!product || !product._id || !product.name || !product.price) {
        throw new Error('Invalid product data');
      }
      addToCart({ ...product, quantity });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setError(null);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  return (
    <div className="add-to-cart-container">
      <div className="quantity-controls">
        <button
          onClick={() => handleQuantityChange(-1)}
          className="quantity-btn"
          disabled={quantity <= 1}
        >
          -
        </button>
        <span className="quantity">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(1)}
          className="quantity-btn"
          disabled={quantity >= 10}
        >
          +
        </button>
      </div>

      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={!product.inStock}
      >
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {showNotification && (
        <div className="notification">
          {quantity} {product.name} added to cart!
        </div>
      )}
    </div>
  );
};

export default AddToCart; 