import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import api from '../../utils/api';
import {
  UserGroupIcon,
  CubeIcon,
  ClipboardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);

  const [showcaseUrl, setShowcaseUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const fetchShowcase = async () => {
      try {
        const res = await api.get('/api/admin/showcase-image');
        if (res.data.url) {
          setShowcaseUrl(res.data.url.startsWith('http') ? res.data.url : BACKEND_URL + res.data.url);
        } else {
          setShowcaseUrl(null);
        }
      } catch (err) {
        setShowcaseUrl(null);
      }
    };
    fetchShowcase();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const statCards = [
    {
      name: 'Pengguna',
      value: stats?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Produk',
      value: stats?.totalProducts || 0,
      icon: CubeIcon,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Pesanan',
      value: stats?.totalOrders || 0,
      icon: ClipboardIcon,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      name: 'Pendapatan',
      value: formatPrice(stats?.totalRevenue),
      icon: BanknotesIcon,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select an image file');
      return;
    }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/api/admin/showcase-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowcaseUrl(res.data.url);
      setFile(null);
    } catch (err) {
      setUploadError('Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dasbor Admin</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to="/admin/orders"
            className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${stat.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold mt-2">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tindakan Cepat</h2>
          <div className="space-y-2">
            <Link
              to="/admin/products"
              className="block text-blue-600 hover:text-blue-800"
            >
              Kelola Produk
            </Link>
            <Link
              to="/admin/orders"
              className="block text-blue-600 hover:text-blue-800"
            >
              Lihat Pesanan
            </Link>
            <Link
              to="/admin/users"
              className="block text-blue-600 hover:text-blue-800"
            >
              Kelola Pengguna
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pesanan Terbaru</h2>
          <div className="space-y-4">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Pesanan #{order._id}</p>
                    <p className="text-sm">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Lihat
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada pesanan terbaru</p>
            )}
          </div>
        </div>
      </div>

      {/* Showcase Image Management */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Gambar Etalase (Penjualan Saat Ini)</h2>
        {showcaseUrl ? (
          <div className="mb-4 flex justify-center">
            <img
              src={showcaseUrl}
              alt="Showcase"
              className="rounded-lg shadow-lg max-h-64 object-contain cursor-pointer transition-transform hover:scale-105"
              onClick={() => window.open(showcaseUrl, '_blank')}
              title="Click to preview full image"
            />
          </div>
        ) : (
          <div className="mb-4 text-gray-500">No showcase image set</div>
        )}
        <form onSubmit={handleUpload} className="flex flex-col items-center">
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload/Change Image'}</button>
        </form>
        {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Status Sistem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status Database</p>
            <p className="text-green-500 font-medium">Terhubung</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status API</p>
            <p className="text-green-500 font-medium">Beroperasi</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Terakhir Diperbarui</p>
            <p className="font-medium">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;