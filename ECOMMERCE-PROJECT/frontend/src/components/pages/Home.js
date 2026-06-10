import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Home.css';

const Home = () => {
  const { addToCart, clearCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('default');
  const [categories] = useState([
    { id: 'all', name: 'All Products', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'clothing', name: 'Clothing', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'home', name: 'Home & Living', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'books', name: 'Books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 'sports', name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from API...');
        const response = await axios.get('http://localhost:5001/api/products');
        console.log('API Response:', response);
        
        if (!response.data) {
          throw new Error('No data received from API');
        }
        
        const products = response.data;
        console.log('Products received:', products);
        setFeaturedProducts(products);
        try {
          clearCart();
        } catch (err) {
          console.error('Error clearing cart:', err);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [clearCart]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFeaturedProducts(featuredProducts);
    } else {
      const filteredProducts = featuredProducts.filter(
        product => product.category === categoryId
      );
      setFeaturedProducts(filteredProducts);
    }
  };

  const handlePriceFilter = (filter) => {
    setPriceFilter(filter);
    const sortedProducts = [...featuredProducts];
    if (filter === 'low-to-high') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (filter === 'high-to-low') {
      sortedProducts.sort((a, b) => b.price - a.price);
    }
    setFeaturedProducts(sortedProducts);
  };

  const handleAddToCart = (product) => {
    console.log('Adding product to cart:', product);
    if (!product._id || !product.name || !product.price || !product.image) {
      console.error('Invalid product data:', product);
      return;
    }
    addToCart(product);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Store</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <div
              key={category.id}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <div className="filter-container">
            <select 
              className="price-filter"
              value={priceFilter}
              onChange={(e) => handlePriceFilter(e.target.value)}
            >
              <option value="default">Sort by Price</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-overlay">
                  <Link to={`/product/${product._id}`} className="view-details-btn">View Details</Link>
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">₹{product.price}</p>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="special-offers-section">
        <div className="offer-card">
          <h3>Special Discount</h3>
          <p>Get 20% off on all products</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
        <div className="offer-card">
          <h3>Free Shipping</h3>
          <p>On orders above ₹2000</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 