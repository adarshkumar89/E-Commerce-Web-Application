import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData, orderId } = location.state || {};

  // If no order data, redirect to home
  React.useEffect(() => {
    if (!orderData && !orderId) {
      navigate('/');
    }
  }, [orderData, orderId, navigate]);

  if (!orderData && !orderId) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <h1>Thank You for Your Order!</h1>
        <p>Your order has been successfully placed and is being processed.</p>
        <p>We'll send you an email confirmation shortly with your order details.</p>
        
        {orderData && (
          <div className="order-details">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {orderData._id}</p>
            <p><strong>Total Amount:</strong> ₹{orderData.totalAmount?.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {orderData.paymentMethod?.toUpperCase()}</p>
            {orderData.paymentMethod === 'upi' && (
              <p><strong>UPI ID:</strong> {orderData.upiId}</p>
            )}
            <p><strong>Shipping Address:</strong> {orderData.shippingAddress}</p>
          </div>
        )}

        <div className="success-actions">
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
          <Link to="/orders" className="view-orders-btn">
            View My Orders
          </Link>
          {orderId && (
            <Link to={`/orders/${orderId}/bill`} className="view-bill-btn">
              View Order Bill
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success; 