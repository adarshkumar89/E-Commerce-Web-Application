import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrdersList.css';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState({});
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const verifyOrder = useCallback(async (orderId) => {
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`http://localhost:5001/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data._id === orderId) {
          return response.data;
        }
        throw new Error('Order verification failed: ID mismatch');
      } catch (error) {
        attempts++;
        console.log(`Verification attempt ${attempts} failed for order ${orderId}:`, error);
        
        if (attempts === MAX_RETRIES) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view your orders.');
      }

      const response = await axios.get('http://localhost:5001/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server.');
      }

      // Verify each order
      const verifiedOrders = [];
      const newVerificationStatus = {};

      for (const order of response.data) {
        try {
          const verifiedOrder = await verifyOrder(order._id);
          verifiedOrders.push(verifiedOrder);
          newVerificationStatus[order._id] = 'verified';
        } catch (error) {
          console.error(`Failed to verify order ${order._id}:`, error);
          newVerificationStatus[order._id] = 'failed';
          // Still include the order but mark it as unverified
          verifiedOrders.push(order);
        }
      }

      setVerificationStatus(newVerificationStatus);
      
      if (verifiedOrders.length === 0) {
        setOrders([]);
        setError('No orders found. Start shopping to create your first order!');
      } else {
        setOrders(verifiedOrders);
        setRetryCount(0);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      let errorMessage = 'Failed to fetch orders. ';
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Please log in to view your orders.';
            break;
          case 403:
            errorMessage = 'You do not have permission to view orders.';
            break;
          case 404:
            errorMessage = 'No orders found. Start shopping to create your first order!';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.message || 'Please try again later.';
        }
      } else if (err.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setRetryCount(prev => prev + 1);
        setTimeout(fetchOrders, RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, verifyOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchOrders();
  };

  const handleVerifyOrder = async (orderId) => {
    try {
      setVerificationStatus(prev => ({ ...prev, [orderId]: 'verifying' }));
      const verifiedOrder = await verifyOrder(orderId);
      setOrders(prev => prev.map(order => 
        order._id === orderId ? verifiedOrder : order
      ));
      setVerificationStatus(prev => ({ ...prev, [orderId]: 'verified' }));
    } catch (error) {
      console.error(`Failed to verify order ${orderId}:`, error);
      setVerificationStatus(prev => ({ ...prev, [orderId]: 'failed' }));
      setError(`Failed to verify order ${orderId}. Please try again.`);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleStartShopping = () => {
    navigate('/products');
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  const handleCopyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      // Show a more visible success message
      alert(`Order ID copied to clipboard: ${orderId}`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy order ID:', err);
      setError('Failed to copy order ID. Please try again.');
    }
  };

  const handleViewBill = (orderId) => {
    try {
      localStorage.setItem('currentOrderId', orderId);
      navigate(`/orders/${orderId}/bill`);
    } catch (err) {
      console.error('Error navigating to bill:', err);
      setError('Failed to view bill. Please try again.');
    }
  };

  const handleViewInvoice = (orderId) => {
    try {
      navigate(`/orders/${orderId}/invoice`);
    } catch (err) {
      console.error('Error navigating to invoice:', err);
      setError('Failed to view invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})` : ''}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            {error.includes('log in') ? (
              <button 
                className="login-btn"
                onClick={handleLogin}
              >
                Log In
              </button>
            ) : error.includes('No orders found') ? (
              <button 
                className="shop-now-btn"
                onClick={handleStartShopping}
              >
                Start Shopping
              </button>
            ) : (
              <>
                <button 
                  className="retry-btn"
                  onClick={handleRetry}
                  disabled={retryCount >= MAX_RETRIES}
                >
                  {retryCount >= MAX_RETRIES ? 'Max Retries Reached' : 'Retry'}
                </button>
                <button 
                  className="refresh-btn"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="no-orders-container">
        <div className="no-orders">
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <button 
            onClick={handleStartShopping}
            className="shop-now-btn"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Your Orders</h1>
        <div className="status-filter">
          <label htmlFor="status">Filter by Status:</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <div className="order-id-section">
                  <h3>Order ID:</h3>
                  <div className="order-id-container">
                    <code className="order-id" style={{ 
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      {order._id}
                    </code>
                    <div className="order-id-actions">
                      <button
                        className="copy-btn"
                        onClick={() => handleCopyOrderId(order._id)}
                        title="Copy Order ID"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        {copiedId === order._id ? '✓ Copied!' : '📋 Copy Order ID'}
                      </button>
                      {verificationStatus[order._id] === 'failed' && (
                        <button
                          className="verify-btn"
                          onClick={() => handleVerifyOrder(order._id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🔄 Verify Order
                        </button>
                      )}
                    </div>
                    {verificationStatus[order._id] === 'verifying' && (
                      <div className="verifying-status">
                        Verifying order...
                      </div>
                    )}
                    {verificationStatus[order._id] === 'failed' && (
                      <div className="verification-failed">
                        Order verification failed. Please try again.
                      </div>
                    )}
                  </div>
                </div>
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
                    <span className="item-name">{item.productId?.name || item.name || 'Product'}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Items</span>
                <span>{order.products?.reduce((acc, item) => acc + item.quantity, 0) || 0}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount - order.shippingFee)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <div className="order-actions">
              <button 
                className="view-bill-btn"
                onClick={() => handleViewBill(order._id)}
              >
                View Bill
              </button>
              <button 
                className="view-invoice-btn"
                onClick={() => handleViewInvoice(order._id)}
              >
                View Invoice
              </button>
              <Link 
                to={`/orders/${order._id}`}
                className="view-details-btn"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersList;