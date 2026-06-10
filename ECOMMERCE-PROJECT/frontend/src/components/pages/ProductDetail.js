import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddToCart from '../common/AddToCart';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        const response = await axios.get(`http://localhost:5001/api/products/${id}`);
        console.log('Product data received:', response.data);
        if (!response.data) {
          throw new Error('No product data received');
        }
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-to-home">
          Back to Home
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-message">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="back-to-home">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img src={product.image} alt={product.name} />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="thumbnail-images">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            <span className="product-rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < (product.rating || 0) ? 'filled' : ''}>★</span>
              ))}
            </span>
          </div>
          <p className="product-price">₹{product.price}</p>
          <p className="product-description">{product.description}</p>

          <AddToCart product={product} />

          <div className="product-details">
            <h3>Product Details</h3>
            <ul>
              <li>
                <span>Brand:</span>
                <span>{product.brand || 'N/A'}</span>
              </li>
              <li>
                <span>Availability:</span>
                <span className={product.inStock ? 'in-stock' : 'out-of-stock'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </li>
              <li>
                <span>Shipping:</span>
                <span>Free shipping on orders above ₹2000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="related-products">
        <h2>You May Also Like</h2>
        <div className="products-grid">
          {/* Related products will be added here */}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 