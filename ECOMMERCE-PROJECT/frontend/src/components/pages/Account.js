import React, { useState } from 'react';
import './Account.css';

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="account-container">
      <h1>My Account</h1>
      
      <div className="account-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'addresses' ? 'active' : ''}
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
        </button>
      </div>

      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Profile Information</h2>
            <form className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" placeholder="Enter your phone number" />
              </div>
              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Order History</h2>
            <div className="orders-list">
              <p>No orders found.</p>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="addresses-section">
            <h2>Saved Addresses</h2>
            <div className="addresses-list">
              <p>No saved addresses.</p>
            </div>
            <button className="add-address-btn">Add New Address</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account; 