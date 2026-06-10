import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderBill.css';

const OrderBill = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate orderId
        if (!orderId || orderId.length < 6) {
          throw new Error('Invalid order ID format');
        }

        // First try to get from localStorage
        const savedOrder = localStorage.getItem(`order_${orderId}`);
        if (savedOrder) {
          const parsedOrder = JSON.parse(savedOrder);
          if (parsedOrder._id === orderId) {
            setOrder(parsedOrder);
            setLoading(false);
            return;
          }
        }

        // If not in localStorage or ID doesn't match, fetch from API
        const response = await axios.get(`http://localhost:5001/api/orders/${orderId}`);
        
        if (!response.data) {
          throw new Error('No order data received from server');
        }

        // Validate the response data
        if (response.data._id !== orderId) {
          throw new Error('Order ID mismatch');
        }

        // Ensure all required fields are present
        const orderData = {
          ...response.data,
          customerName: response.data.customerName || 'N/A',
          customerEmail: response.data.customerEmail || 'N/A',
          shippingAddress: response.data.shippingAddress || 'N/A',
          products: (response.data.products || []).map(item => ({
            ...item,
            productId: item.productId || { name: 'Product Not Available', price: 0, image: '/placeholder.png' },
            price: item.price || 0,
            quantity: item.quantity || 0
          })),
          subtotal: response.data.subtotal || 0,
          shippingFee: response.data.shippingFee || 0,
          totalAmount: response.data.totalAmount || 0,
          paymentMethod: response.data.paymentMethod || 'N/A',
          paymentStatus: response.data.paymentStatus || 'Pending',
          paymentDate: response.data.paymentDate || new Date().toISOString(),
          status: response.data.status || 'Pending'
        };

        setOrder(orderData);
        // Save to localStorage for future use
        localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        
        let errorMessage = 'Failed to fetch order details';
        
        if (err.response) {
          // Server responded with an error
          switch (err.response.status) {
            case 404:
              errorMessage = 'Order not found. Please check the order ID and try again.';
              break;
            case 401:
              errorMessage = 'Please log in to view order details.';
              break;
            case 403:
              errorMessage = 'You do not have permission to view this order.';
              break;
            default:
              errorMessage = `Server error: ${err.response.data?.message || 'Unknown error'}`;
          }
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else {
          // Something else happened
          errorMessage = err.message || 'An unexpected error occurred';
        }

        setError(errorMessage);
        setLoading(false);

        // Auto retry logic
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchOrder();
          }, 2000); // Retry after 2 seconds
        }
      }
    };

    fetchOrder();
  }, [orderId, retryCount]);

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    setError(null);
    setLoading(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="order-bill-container">
        <div className="loading-spinner"></div>
        <p>Loading order details{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})` : ''}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-bill-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-button">
              Retry
            </button>
            <button onClick={handleBack} className="back-button">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-bill-container">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>The requested order could not be found.</p>
          <button onClick={handleBack} className="back-button">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-bill-container">
      <div className="order-bill">
        <div className="bill-header">
          <h1>Order Bill</h1>
          <div className="order-meta">
            <p>Order ID: <span>{order._id}</span></p>
            <p>Date: <span>{new Date(order.createdAt).toLocaleDateString()}</span></p>
            <p>Status: <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></p>
          </div>
        </div>

        <div className="bill-content">
          <div className="customer-details">
            <h2>Customer Details</h2>
            <div className="details-grid">
              <div>
                <p>Name: <span>{order.customerName}</span></p>
                <p>Email: <span>{order.customerEmail}</span></p>
              </div>
              <div>
                <p>Shipping Address: <span>{order.shippingAddress}</span></p>
              </div>
            </div>
          </div>

          <div className="order-items">
            <h2>Order Items</h2>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="item-info">
                        <img 
                          src={item.productId?.image || '/placeholder.png'} 
                          alt={item.productId?.name || item.name || 'Product'} 
                        />
                        <span>{item.productId?.name || item.name || 'Unknown Product'}</span>
                      </div>
                    </td>
                    <td>₹{(item.price || 0).toFixed(2)}</td>
                    <td>{item.quantity || 0}</td>
                    <td>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bill-summary">
            <h2>Bill Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Shipping</span>
                <span>₹{order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-details">
            <h2>Payment Details</h2>
            <div className="details-grid">
              <div>
                <p>Payment Method: <span>{order.paymentMethod}</span></p>
                {order.upiId && <p>UPI ID: <span>{order.upiId}</span></p>}
              </div>
              <div>
                <p>Payment Status: <span className={`status-badge ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></p>
                <p>Payment Date: <span>{new Date(order.paymentDate).toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bill-footer">
          <button onClick={handlePrint} className="print-button">
            Print Bill
          </button>
          <button onClick={handleBack} className="back-button">
            Back to Orders
          </button>
          <p className="thank-you">Thank you for shopping with us!</p>
        </div>
      </div>
    </div>
  );
};

export default OrderBill; 