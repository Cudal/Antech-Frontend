import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Details</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>Order ID: {id}</p>
        {/* Order details will be added here */}
      </div>
    </div>
  );
};

export default OrderDetails; 