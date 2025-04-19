import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/my-orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil pesanan');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format price to IDR
  const formatToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
        <div className="text-center">Memuat pesanan...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Pesanan Saya</h1>
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 text-center">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 p-6">
            Anda belum memiliki pesanan
          </div>
        ) : (
          <div className="w-full min-w-[500px]">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    ID Pesanan
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Nama Item
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-gray-900 break-all">
                      {order._id}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <ul className="list-none p-0 m-0">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-gray-900">
                            {item.productDetails?.name || '-'} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                      {formatToIDR(order.totalAmount)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;