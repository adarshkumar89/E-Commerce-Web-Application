import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Shop from './components/pages/Shop';
import ProductDetail from './components/pages/ProductDetail';
import Cart from './components/pages/Cart';
import Checkout from './components/pages/Checkout';
import Payment from './components/pages/Payment';
import Success from './components/pages/Success';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Account from './components/pages/Account';
import Contact from './components/pages/Contact';
import About from './components/pages/About';
import FAQ from './components/pages/FAQ';
import OrdersList from './components/pages/OrdersList';
import OrderBill from './components/pages/OrderBill';
import Invoice from './components/pages/Invoice';
import SearchPage from './components/pages/SearchPage';
import './App.css';

// Create router with future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <CartProvider>
      <Router future={router.future}>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/success" element={<Success />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/orders/:orderId/bill" element={<OrderBill />} />
              <Route path="/orders/:orderId/invoice" element={<Invoice />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App; 