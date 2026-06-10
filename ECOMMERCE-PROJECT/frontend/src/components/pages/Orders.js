import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const response = await axios.get('http://localhost:5001/api/orders');
      console.log('Orders response:', response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again later.');
      setLoading(false);
    }
  };

  const handleQuantityChange = async (orderId, itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent negative quantities
    
    try {
      console.log('Updating quantity:', { orderId, itemId, newQuantity });
      const response = await axios.put(`http://localhost:5001/api/orders/${orderId}/items/${itemId}`, {
        quantity: newQuantity
      });
      console.log('Update response:', response.data);
      
      // Update the orders state with the new quantity
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            products: order.products.map(item => {
              if (item._id === itemId) {
                return { ...item, quantity: newQuantity };
              }
              return item;
            }),
            totalAmount: response.data.totalAmount
          };
        }
        return order;
      }));
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchOrders}>Retry</button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="no-orders">
          <h2>No orders found</h2>
          <p>You haven't placed any orders yet.</p>
          <a href="/products" className="shop-link">Start Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>Your Orders</h1>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3 className="order-id">Order #{order._id.slice(-6)}</h3>
                <p className="order-date">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-items">
              {order.products && order.products.map(item => (
                <div key={item._id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.productId?.name || 'Product'}</span>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(order._id, item._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="item-quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(order._id, item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="item-price">{formatPrice(item.productId?.price || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-summary">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatPrice(order.totalAmount || 0)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">{formatPrice(order.shippingFee || 0)}</span>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">Total</span>
                <span className="summary-value">
                  {formatPrice((order.totalAmount || 0) + (order.shippingFee || 0))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 