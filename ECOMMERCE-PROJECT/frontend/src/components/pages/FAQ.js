import React from 'react';
import './FAQ.css';

const FAQ = () => {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, UPI payments (Google Pay, PhonePe, Paytm), and net banking. All payments are processed securely through our payment gateway."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days within India. Express shipping is available for 1-2 day delivery. International shipping may take 7-14 business days depending on the destination."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Please contact our customer service team to initiate a return."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can check shipping costs during checkout."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email. You can also track your order status by logging into your account and visiting the 'Orders' section."
    },
    {
      question: "What if I receive a damaged product?",
      answer: "If you receive a damaged product, please take photos and contact our customer service within 48 hours of delivery. We'll arrange a replacement or refund as appropriate."
    }
  ];

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 