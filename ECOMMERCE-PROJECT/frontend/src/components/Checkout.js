import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    shippingAddress: ''
  });
  const [cart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Your cart is empty. Please add products before proceeding to checkout.');
      navigate('/cart');
      return;
    }

    const orderData = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      shippingAddress: formData.shippingAddress,
      products: cart.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      totalAmount: calculateTotal(),
      subtotal: calculateTotal(),
      shippingFee: 0 // You can add shipping fee calculation logic here
    };
    
    // Navigate to payment page with order data
    navigate('/payment', { state: { orderData } });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (cart.length === 0) {
    return (
      <div className="checkout">
        <h1>Checkout</h1>
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <button onClick={() => navigate('/shop')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cart.map((item, index) => (
          <div key={index} className="order-item">
            <p>{item.name} x {item.quantity}</p>
            <p>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <div className="total">
          <h3>Total: ${calculateTotal().toFixed(2)}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Shipping Address:</label>
          <textarea
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Proceed to Payment</button>
      </form>
    </div>
  );
}

export default Checkout; 