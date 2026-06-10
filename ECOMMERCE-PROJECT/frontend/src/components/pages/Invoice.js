import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './Invoice.css';

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: urlOrderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const verifyOrder = useCallback(async (orderId) => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    while (retryCount < maxRetries) {
      try {
        console.log(`Verifying order ${orderId}, attempt ${retryCount + 1}`);
        const response = await axios.get(`http://localhost:5001/api/orders/${orderId}`);
        
        if (response.data && response.data._id === orderId) {
          console.log('Order verified successfully:', response.data);
          return response.data;
        }
        
        throw new Error('Order verification failed: ID mismatch');
      } catch (error) {
        console.error(`Order verification attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount === maxRetries - 1) {
          if (error.response) {
            switch (error.response.status) {
              case 404:
                throw new Error('Order not found. Please check the order ID and try again.');
              case 401:
                throw new Error('Please log in to view this order.');
              case 403:
                throw new Error('You do not have permission to view this order.');
              default:
                throw new Error(error.response.data?.message || 'Failed to verify order.');
            }
          } else if (error.request) {
            throw new Error('Unable to connect to the server. Please check your internet connection.');
          } else {
            throw error;
          }
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    throw new Error('Failed to verify order after multiple attempts.');
  }, []);

  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get order ID from URL params, location state, or localStorage
      const orderId = urlOrderId || location.state?.orderId || localStorage.getItem('currentOrderId');
      
      if (!orderId) {
        throw new Error('No order ID found. Please complete checkout first.');
      }

      console.log('Attempting to fetch order with ID:', orderId);

      // Try to fetch order with retries
      let orderData = null;
      let currentRetry = 0;

      while (currentRetry < MAX_RETRIES && !orderData) {
        try {
          orderData = await verifyOrder(orderId);
          break;
        } catch (error) {
          console.error(`Retry ${currentRetry + 1} failed:`, error);
          if (currentRetry === MAX_RETRIES - 1) {
            throw error;
          }
          currentRetry++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      if (!orderData) {
        throw new Error('Failed to fetch order after multiple attempts.');
      }

      // Save verified order data to localStorage
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      localStorage.setItem('currentOrderId', orderData._id);

      setOrder(orderData);
      setRetryCount(0); // Reset retry count on success

    } catch (error) {
      console.error('Error loading order:', error);
      setError(error.message || 'Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [urlOrderId, location.state, verifyOrder]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const handleBackToOrders = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="invoice-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading order details{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})` : ''}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry} 
              className="retry-button"
              disabled={retryCount >= MAX_RETRIES}
            >
              Retry
            </button>
            <button 
              onClick={handleBackToOrders} 
              className="back-to-orders-btn"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="invoice-container">
        <div className="error-message">
          <h2>No Order Found</h2>
          <p>Unable to load order details. Please try again or check your order history.</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry} 
              className="retry-button"
              disabled={retryCount >= MAX_RETRIES}
            >
              Retry
            </button>
            <button 
              onClick={handleBackToOrders} 
              className="back-to-orders-btn"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h1>Order Invoice</h1>
        <div className="invoice-details">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      </div>

      <div className="customer-details">
        <h2>Customer Information</h2>
        <p><strong>Name:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.customerEmail}</p>
        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
      </div>

      <div className="order-items">
        <h2>Order Items</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.products?.map((item, index) => {
              const price = parseFloat(item.price) || 0;
              const quantity = parseInt(item.quantity) || 0;
              return (
                <tr key={index}>
                  <td>{item.name || item.productId?.name || 'Product'}</td>
                  <td>{quantity}</td>
                  <td>₹{price.toFixed(2)}</td>
                  <td>₹{(price * quantity).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="order-summary">
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>₹{(parseFloat(order.subtotal) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Shipping Fee:</span>
          <span>₹{(parseFloat(order.shippingFee) || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <span>₹{(parseFloat(order.totalAmount) || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-info">
        <h2>Payment Information</h2>
        <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
        <p><strong>Payment Status:</strong> {order.paymentStatus || 'Pending'}</p>
        {order.paymentDate && (
          <p><strong>Payment Date:</strong> {new Date(order.paymentDate).toLocaleString()}</p>
        )}
      </div>

      <div className="invoice-actions">
        <button onClick={() => window.print()} className="print-button">
          Print Invoice
        </button>
        <button onClick={handleBackToOrders} className="back-button">
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default Invoice; 