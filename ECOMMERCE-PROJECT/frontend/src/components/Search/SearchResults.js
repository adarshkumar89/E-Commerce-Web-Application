import React from 'react';
import { Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = ({ results, loading, error }) => {
  if (loading) {
    return (
      <div className="search-loading">
        <div className="loading-spinner"></div>
        <p>Searching products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <p>No products found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-grid">
        {results.map((product) => (
          <div key={product._id} className="product-card">
            <Link to={`/product/${product._id}`}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">₹{product.price}</p>
                <p className="product-category">{product.category}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults; 