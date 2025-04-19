import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        dispatch({ type: 'products/fetchProducts/fulfilled', payload: response.data });
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, [dispatch]);

  const handleOrder = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        items: [{
          product: product._id,
          quantity: 1,
          price: product.price
        }],
        shippingAddress: {
          street: "Default Street",
          city: "Default City",
          state: "Default State",
          zipCode: "12345",
          country: "Default Country"
        }
      };

      await api.post('/api/orders', orderData);
      setSuccessMessage(`Successfully ordered ${product.name}!`);
      // Refresh products to update stock
      const fetchProducts = async () => {
        try {
          const response = await api.get('/api/products');
          dispatch({ type: 'products/fetchProducts/fulfilled', payload: response.data });
        } catch (error) {
          console.error('Error fetching products:', error);
          setError('Failed to fetch products');
        }
      };
      fetchProducts();
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      {products.length === 0 ? (
        <div className="text-center text-gray-500">No products found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(product.price)}
                  </span>
                  <span className={`text-sm ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-center bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors duration-300"
                  >
                    View Details
                  </Link>
                  {user?.role !== 'admin' && (
                    <button
                      onClick={() => handleOrder(product)}
                      disabled={product.stock === 0}
                      className={`py-2 rounded-md transition-colors duration-300 ${
                        product.stock > 0
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Order Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products; 