import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SearchResults from '../Search/SearchResults';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = searchParams.get('q');

  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:5001/api/products/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while searching products');
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        {query && <p>Showing results for: "{query}"</p>}
      </div>
      <SearchResults results={results} loading={loading} error={error} />
    </div>
  );
};

export default SearchPage; 