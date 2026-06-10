import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Checkout.css';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal } = useCart();
  const [formData, setFormData] = useState({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate cart data
  useEffect(() => {
    if (!cart || cart.length === 0) {
      setError('Your cart is empty. Please add items before checkout.');
    }
  }, [cart]);

  const handleChange = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      shipping: {
        ...prevState.shipping,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, address, city, state, zipCode, country } = formData.shipping;
    
    if (!firstName || !lastName || !email || !address || !city || !state || !zipCode || !country) {
      throw new Error('Please fill in all shipping information fields.');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (zipCode.length < 5) {
      throw new Error('Please enter a valid ZIP code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      // Validate cart
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }

      // Validate form
      validateForm();

      // Prepare order data
      const orderData = {
        products: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        customerName: `${formData.shipping.firstName} ${formData.shipping.lastName}`,
        customerEmail: formData.shipping.email,
        shippingAddress: `${formData.shipping.address}, ${formData.shipping.city}, ${formData.shipping.state}, ${formData.shipping.zipCode}, ${formData.shipping.country}`,
        totalAmount: getCartTotal(),
        shippingFee: 10.00,
        subtotal: getCartTotal() - 10.00
      };

      console.log('Preparing order data:', orderData);

      // Navigate to payment with order data
      navigate('/payment', { 
        state: { orderData }
      });

    } catch (error) {
      console.error('Error in checkout:', error);
      let errorMessage = 'Failed to process order. Please try again.';
      
      if (error.response) {
        // Server responded with an error
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.message || 'Invalid order data';
            break;
          case 401:
            errorMessage = 'Please log in to complete checkout';
            break;
          case 403:
            errorMessage = 'Checkout not authorized';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          default:
            errorMessage = error.response.data.message || 'Failed to create order';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart-message">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <div className="empty-cart-actions">
            <button onClick={() => navigate('/products')} className="continue-shopping-btn">
              Browse Products
            </button>
            <button onClick={() => navigate('/')} className="home-btn">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Shipping Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={formData.shipping.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={formData.shipping.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.shipping.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={formData.shipping.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={formData.shipping.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={formData.shipping.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                value={formData.shipping.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={formData.shipping.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="order-summary-section">
          <h2>Order Summary</h2>
          {cart.map((item, index) => (
            <div key={index} className="summary-item">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-item">
            <span>Shipping</span>
            <span>₹10.00</span>
          </div>
          <div className="summary-item total">
            <span>Total</span>
            <span>₹{getCartTotal().toFixed(2)}</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="proceed-to-payment-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
};

export default Checkout; 