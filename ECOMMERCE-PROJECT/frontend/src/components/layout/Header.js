import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const { getCartItemCount } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="contact-info">
              <span>📞 +1 234 567 890</span>
              <span>✉️ support@ecommerce.com</span>
            </div>
            <div className="header-links">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <div className="logo">
              <Link to="/">E-Commerce</Link>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>

            <div className="header-actions">
              <Link to="/cart" className="cart-icon">
                <FaShoppingCart />
                <span className="cart-count">{getCartItemCount()}</span>
              </Link>
              {isAuthenticated ? (
                <div className="user-dropdown" ref={dropdownRef}>
                  <button
                    className="user-icon"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <FaUser />
                  </button>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/profile">Profile</Link>
                      <Link to="/orders">Orders</Link>
                      <Link to="/wishlist">Wishlist</Link>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-btn">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="main-nav">
        <div className="container">
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/shop?category=electronics">Electronics</Link></li>
            <li><Link to="/shop?category=clothing">Clothing</Link></li>
            <li><Link to="/shop?category=home">Home & Living</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 