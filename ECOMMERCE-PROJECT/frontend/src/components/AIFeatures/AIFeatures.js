import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AIFeatures.css';

const AIFeatures = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sizeRecommendations, setSizeRecommendations] = useState({});
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Fetch personalized recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/recommendations', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, []);

  // Fetch recent orders for one-click reordering
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders/recent', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecentOrders(response.data);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    fetchRecentOrders();
  }, []);

  // Voice Search Implementation
  const startVoiceSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await axios.post('http://localhost:5000/api/voice-search', formData);
          const transcribedText = response.data.text;
          setSearchQuery(transcribedText);
          navigate(`/search?q=${encodeURIComponent(transcribedText)}`);
        } catch (error) {
          console.error('Error processing voice search:', error);
        }
      };

      mediaRecorder.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVoiceSearch = () => {
    if (mediaRecorder.current && isListening) {
      mediaRecorder.current.stop();
      setIsListening(false);
    }
  };

  // Visual Search Implementation
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post('http://localhost:5000/api/visual-search', formData);
        const similarProducts = response.data.similarProducts;
        navigate(`/search?visual=${encodeURIComponent(JSON.stringify(similarProducts))}`);
      } catch (error) {
        console.error('Error processing visual search:', error);
      }
    }
  };

  // One-Click Reordering
  const handleOneClickReorder = async (orderId) => {
    try {
      await axios.post(`http://localhost:5000/api/orders/reorder/${orderId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  // Size/Style Assistant
  const getSizeRecommendation = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/size-recommendation/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSizeRecommendations(prev => ({
        ...prev,
        [productId]: response.data.recommendedSize
      }));
    } catch (error) {
      console.error('Error getting size recommendation:', error);
    }
  };

  return (
    <div className="ai-features-container">
      <div className="search-section">
        <h2>Smart Search</h2>
        <div className="search-options">
          <div className="voice-search">
            <button 
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`voice-search-btn ${isListening ? 'listening' : ''}`}
            >
              {isListening ? 'Stop Listening' : 'Voice Search'}
            </button>
            {searchQuery && (
              <p className="search-query">Searching for: {searchQuery}</p>
            )}
          </div>
          <div className="visual-search">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="visual-search-input"
              className="visual-search-input"
            />
            <label htmlFor="visual-search-input" className="visual-search-btn">
              Upload Image
            </label>
            {selectedImage && (
              <img src={selectedImage} alt="Selected" className="preview-image" />
            )}
          </div>
        </div>
      </div>

      <div className="recommendations-section">
        <h2>Recommended for You</h2>
        <div className="recommendations-grid">
          {recommendations.map(product => (
            <div key={product._id} className="recommendation-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <button 
                onClick={() => getSizeRecommendation(product._id)}
                className="size-recommendation-btn"
              >
                Get Size Recommendation
              </button>
              {sizeRecommendations[product._id] && (
                <p className="size-recommendation">
                  Recommended Size: {sizeRecommendations[product._id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="reorder-section">
        <h2>Quick Reorder</h2>
        <div className="recent-orders">
          {recentOrders.map(order => (
            <div key={order._id} className="reorder-card">
              <div className="order-info">
                <h3>Order #{order._id.slice(-6)}</h3>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handleOneClickReorder(order._id)}
                className="reorder-btn"
              >
                Reorder
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIFeatures; 