import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Our E-commerce Store</h1>
        <p>Your trusted destination for quality products and exceptional service</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2024, our e-commerce store began with a simple mission: to provide customers with 
            high-quality products at competitive prices, delivered with outstanding customer service. 
            What started as a small online shop has grown into a trusted destination for shoppers worldwide.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            We are committed to making online shopping a seamless and enjoyable experience. 
            Our mission is to offer a curated selection of products, ensure fast and reliable delivery, 
            and provide exceptional customer support at every step of your shopping journey.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <ul>
            <li>Quality: We carefully select and test every product we sell</li>
            <li>Customer Satisfaction: Your happiness is our top priority</li>
            <li>Innovation: We continuously improve our services and offerings</li>
            <li>Integrity: We conduct business with honesty and transparency</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Fast Shipping</h3>
              <p>Quick and reliable delivery to your doorstep</p>
            </div>
            <div className="feature">
              <h3>Secure Payments</h3>
              <p>Safe and encrypted payment processing</p>
            </div>
            <div className="feature">
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer service</p>
            </div>
            <div className="feature">
              <h3>Easy Returns</h3>
              <p>Hassle-free return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 