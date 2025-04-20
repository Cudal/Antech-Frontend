import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, deleteOrder, deleteAllOrders } from '../../store/slices/orderSlice';
import { fetchUsers } from '../../store/slices/userSlice';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, deleteLoading } = useSelector((state) => state.orders);
  const { users } = useSelector((state) => state.users);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    dispatch(fetchAllOrders(selectedUser ? { user: selectedUser } : undefined));
  }, [dispatch, selectedUser]);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 1000 })); // fetch all users for dropdown
  }, [dispatch]);

  const handleDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete === 'all') {
      await dispatch(deleteAllOrders());
    } else {
      await dispatch(deleteOrder(orderToDelete));
    }
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredAndSortedOrders = () => {
    let filteredOrders = [...orders];

    // Apply sorting
    filteredOrders.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'total') {
        return sortOrder === 'desc' 
          ? b.totalAmount - a.totalAmount
          : a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    return filteredOrders;
  };

  const getOrderStatus = (order) => {
    if (!order.status) return 'Pending';
    return order.status.charAt(0).toUpperCase() + order.status.slice(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <div className="flex gap-4">
          {/* User Filter Dropdown */}
          <select
            className="border rounded-md px-3 py-2"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
          >
            <option value="">All Users</option>
            {users && users.map(user => (
              <option value={user._id} key={user._id}>{user.username}</option>
            ))}
          </select>
          <select
            className="border rounded-md px-3 py-2"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="total-desc">Highest Total</option>
            <option value="total-asc">Lowest Total</option>
          </select>
          <button
            onClick={() => handleDeleteOrder('all')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={deleteLoading || orders.length === 0}
          >
            Clear All Orders
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredAndSortedOrders().map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.username || 'Unknown User'}
                    <div className="text-xs text-gray-400">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-h-20 overflow-y-auto">
                      {order.items?.map((item, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-900">
                            {item.productDetails?.name || 'Product Removed'} 
                          </span>
                          <span className="text-gray-500">
                            {' × '}{item.quantity}
                          </span>
                          <span className="text-gray-400 ml-1">
                            ({formatPrice(item.productDetails?.price || item.price)})
                          </span>
                        </div>
                      )) || 'No items'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getOrderStatus(order)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                        onClick={() => {
                          // View order details (to be implemented)
                          console.log('View order details:', order._id);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 font-medium"
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={deleteLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-4">
              {orderToDelete === 'all' 
                ? 'Apakah Anda yakin ingin menghapus semua pesanan?' 
                : 'Apakah Anda yakin ingin menghapus pesanan ini?'}
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 