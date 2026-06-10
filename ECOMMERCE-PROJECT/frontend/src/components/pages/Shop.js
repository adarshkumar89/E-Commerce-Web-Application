import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Shop.css';

const Shop = () => {
  const [products] = useState([
    {
      id: 1,
      name: 'Premium Smartphone',
      price: 8999,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Electronics',
      rating: 4.5,
      reviews: 25
    },
    {
      id: 2,
      name: 'Designer T-Shirt',
      price: 12499,
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Clothing',
      rating: 4.2,
      reviews: 18
    },
    {
      id: 3,
      name: 'Modern Home Decor',
      price: 6999,
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Home',
      rating: 4.7,
      reviews: 32
    },
    {
      id: 4,
      name: 'Wireless Headphones',
      price: 5999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Electronics',
      rating: 4.8,
      reviews: 45
    },
    {
      id: 5,
      name: 'Leather Wallet',
      price: 2499,
      image: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Accessories',
      rating: 4.3,
      reviews: 12
    },
    {
      id: 6,
      name: 'Smart Watch',
      price: 12999,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Electronics',
      rating: 4.6,
      reviews: 38
    },
    {
      id: 7,
      name: 'Cotton Kurta',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1591047129289-5b0ad0b5b0a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Clothing',
      rating: 4.4,
      reviews: 22
    },
    {
      id: 8,
      name: 'Coffee Maker',
      price: 7999,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Home',
      rating: 4.9,
      reviews: 28
    },
    {
      id: 9,
      name: 'Sunglasses',
      price: 1999,
      image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Accessories',
      rating: 4.1,
      reviews: 15
    },
    {
      id: 10,
      name: 'Laptop Backpack',
      price: 4499,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Accessories',
      rating: 4.7,
      reviews: 31
    },
    {
      id: 11,
      name: 'Smart TV',
      price: 34999,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Electronics',
      rating: 4.8,
      reviews: 42
    },
    {
      id: 12,
      name: 'Dining Table Set',
      price: 24999,
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Home',
      rating: 4.6,
      reviews: 19
    }
  ]);

  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sortBy: 'featured'
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredProducts = products.filter(product => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (product.price < min || product.price > max) {
        return false;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="shop-container">
      <h1>Shop</h1>
      
      <div className="shop-content">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="0-5000">Under ₹5,000</option>
              <option value="5000-10000">₹5,000 - ₹10,000</option>
              <option value="10000-20000">₹10,000 - ₹20,000</option>
              <option value="20000-99999">Over ₹20,000</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="products-grid">
          {sortedProducts.map(product => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                  <p className="product-category">{product.category}</p>
                  <div className="product-rating">
                    <span>★ {product.rating}</span>
                    <span>({product.reviews} reviews)</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop; 