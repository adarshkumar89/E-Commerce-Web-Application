import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Payment.css';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const MAX_AUTO_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const validateOrderData = (data) => {
    if (!data) {
      throw new Error('No order data found. Please complete checkout first.');
    }

    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      throw new Error('Your order is empty. Please add products to your cart.');
    }

    if (!data.totalAmount || isNaN(data.totalAmount) || data.totalAmount <= 0) {
      throw new Error('Invalid order total. Please try again.');
    }

    if (!data.customerName || !data.customerEmail || !data.shippingAddress) {
      throw new Error('Missing customer information. Please complete checkout first.');
    }

    return true;
  };

  const validatePaymentData = () => {
    if (selectedPaymentMethod === 'upi') {
      if (!upiId) {
        throw new Error('Please enter your UPI ID');
      }
      if (!upiId.includes('@')) {
        throw new Error('Please enter a valid UPI ID (e.g., example@upi)');
      }
    }
  };

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
                throw new Error('Order not found. Please try again or create a new order.');
              case 401:
                throw new Error('Please log in to view your order.');
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

  const fetchOrderData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data = null;
      let error = null;

      // Try all data sources in sequence
      try {
        // 1. Try location state first (most reliable)
        if (location.state?.orderData) {
          data = location.state.orderData;
          console.log('Order data from location state:', data);
          
          // If we have an orderId, verify it exists
          if (data._id) {
            try {
              const verifiedData = await verifyOrder(data._id);
              data = verifiedData;
            } catch (verifyError) {
              console.error('Order verification failed:', verifyError);
              // Don't throw here, just use the original data
            }
          }
          
          // Save to localStorage for persistence
          localStorage.setItem('currentOrder', JSON.stringify(data));
          if (data._id) {
            localStorage.setItem('currentOrderId', data._id);
          }
        }
        
        // 2. Try localStorage if no location state
        if (!data) {
          const savedOrderData = localStorage.getItem('currentOrder');
          const savedOrderId = localStorage.getItem('currentOrderId');
          
          if (savedOrderData) {
            data = JSON.parse(savedOrderData);
            console.log('Order data from localStorage:', data);
            
            // If we have an orderId, verify it exists
            if (data._id) {
              try {
                const verifiedData = await verifyOrder(data._id);
                data = verifiedData;
                
                // Update localStorage with verified data
                localStorage.setItem('currentOrder', JSON.stringify(data));
              } catch (verifyError) {
                console.error('Order verification failed:', verifyError);
                // Don't throw here, just use the original data
              }
            }
          }
        }

        // Validate the data
        if (data) {
          validateOrderData(data);
        } else {
          throw new Error('No order data found. Please complete checkout first.');
        }

        // Save valid order data
        setOrderData(data);
        setAutoRetryCount(0); // Reset auto retry count on success

      } catch (err) {
        error = err;
        console.error('Data fetch error:', err);
        
        // Auto retry logic
        if (autoRetryCount < MAX_AUTO_RETRIES) {
          console.log(`Retrying... Attempt ${autoRetryCount + 1} of ${MAX_AUTO_RETRIES}`);
          setAutoRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchOrderData();
          }, RETRY_DELAY);
          return;
        }
      }

      if (error) {
        throw error;
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [location.state, verifyOrder, autoRetryCount, MAX_AUTO_RETRIES, RETRY_DELAY]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData, retryCount]);

  const handleRetry = () => {
    setAutoRetryCount(0); // Reset auto retry count
    setRetryCount(prev => prev + 1);
  };

  const handleBackToCheckout = () => {
    // Clear any saved order data
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('currentOrderId');
    navigate('/checkout');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      validatePaymentData();

      // Create the order with payment information
      const orderPayload = {
        ...orderData,
        paymentMethod: selectedPaymentMethod,
        upiId: selectedPaymentMethod === 'upi' ? upiId : undefined,
        status: 'pending',
        paymentStatus: 'pending'
      };

      console.log('Creating order with data:', orderPayload);
      
      const response = await axios.post('http://localhost:5001/api/orders', orderPayload);
      const createdOrder = response.data;

      // Save order ID for verification
      localStorage.setItem('currentOrderId', createdOrder._id);
      
      // Navigate to success page
      navigate('/success', { 
        state: { 
          orderId: createdOrder._id,
          orderData: createdOrder
        }
      });
    } catch (error) {
      console.error('Error in payment submission:', error);
      setError(error.response?.data?.message || error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="payment-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading order details{autoRetryCount > 0 ? ` (Attempt ${autoRetryCount + 1}/${MAX_AUTO_RETRIES + 1})` : ''}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry} 
              className="retry-button"
              disabled={isProcessing}
            >
              Retry
            </button>
            <button 
              onClick={handleBackToCheckout} 
              className="back-to-checkout-btn"
              disabled={isProcessing}
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="payment-container">
        <div className="error-message">
          <h2>No Order Data</h2>
          <p>Unable to load order details. Please try again or return to checkout.</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry} 
              className="retry-button"
              disabled={isProcessing}
            >
              Retry
            </button>
            <button 
              onClick={handleBackToCheckout} 
              className="back-to-checkout-btn"
              disabled={isProcessing}
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>Payment</h1>
      <div className="order-summary">
        <h2>Order Summary</h2>
        {orderData.products?.map((item, index) => (
          <div key={index} className="summary-item">
            <span>{item.name || item.productId?.name || 'Product'} x {item.quantity || 0}</span>
            <span>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-item">
          <span>Subtotal</span>
          <span>₹{(orderData.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Shipping Fee</span>
          <span>₹{(orderData.shippingFee || 0).toFixed(2)}</span>
        </div>
        <div className="summary-item total">
          <span>Total Amount</span>
          <span>₹{(orderData.totalAmount || 0).toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          <div className="payment-option">
            <input
              type="radio"
              id="upi"
              name="paymentMethod"
              value="upi"
              checked={selectedPaymentMethod === 'upi'}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              disabled={isProcessing}
            />
            <label htmlFor="upi">UPI Payment</label>
          </div>
          <div className="payment-option">
            <input
              type="radio"
              id="card"
              name="paymentMethod"
              value="card"
              checked={selectedPaymentMethod === 'card'}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              disabled={isProcessing}
            />
            <label htmlFor="card">Credit/Debit Card</label>
          </div>
        </div>

        {selectedPaymentMethod === 'upi' && (
          <div className="upi-section">
            <div className="form-group">
              <label>UPI ID:</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                required
                disabled={isProcessing}
              />
            </div>
            <div className="upi-apps">
              <h4>Popular UPI Apps</h4>
              <div className="upi-app-icons">
                <div className="upi-app">
                  <div className="upi-app-icon google-pay">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png" 
                      alt="Google Pay"
                    />
                  </div>
                  <span>Google Pay</span>
                </div>
                <div className="upi-app">
                  <div className="upi-app-icon phonepe">
                    <img 
                      src="https://www.phonepe.com/webstatic/static/phonepe-ogimage-1f5c0b3e.jpg" 
                      alt="PhonePe"
                    />
                  </div>
                  <span>PhonePe</span>
                </div>
                <div className="upi-app">
                  <div className="upi-app-icon paytm">
                    <img 
                      src="https://www.paytm.com/images/paytm_logo.png" 
                      alt="Paytm"
                    />
                  </div>
                  <span>Paytm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPaymentMethod === 'card' && (
          <div className="card-section">
            <div className="form-group">
              <label>Card Number:</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456" 
                required 
                disabled={isProcessing}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date:</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  required 
                  disabled={isProcessing}
                />
              </div>
              <div className="form-group">
                <label>CVV:</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  required 
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="pay-button"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Payment...' : `Pay ₹${orderData.totalAmount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

export default Payment; 