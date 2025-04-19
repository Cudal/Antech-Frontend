import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect to products page
    navigate('/products');
  }, [navigate]);

  // Return null since we're redirecting anyway
  return null;
};

export default Home; 