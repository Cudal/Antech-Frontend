import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser, createUser } from '../../store/slices/userSlice';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await dispatch(updateUser({ 
          id: editingUser._id, 
          ...formData,
          // Only include password if it's been changed
          ...(formData.password ? { password: formData.password } : {})
        }));
      } else {
        await dispatch(createUser(formData));
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'user' });
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Clear password field when editing
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await dispatch(updateUser({ id: userId, role: newRole }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await dispatch(deleteUser(userId));
    }
  };

  const getSortedUsers = () => {
    if (!users) return [];
    
    return [...users].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'username') {
        return sortOrder === 'desc'
          ? b.username.localeCompare(a.username)
          : a.username.localeCompare(b.username);
      }
      return 0;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading users...</div>
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
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Kelola Pengguna</h1>
          <span className="text-gray-600 text-sm">Total Pengguna: {users ? users.length : 0}</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ username: '', password: '', role: 'user' });
              setIsModalOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Tambah Pengguna
          </button>
          <select
            className="border rounded-md px-3 py-2"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <option value="date-desc">Terbaru</option>
            <option value="date-asc">Terlama</option>
            <option value="username-asc">Username A-Z</option>
            <option value="username-desc">Username Z-A</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Bergabung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedUsers().map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                      disabled={user.role === 'admin'} // Prevent changing admin roles
                    >
                      <option value="user">Pengguna</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                      disabled={user.role === 'admin'} // Prevent deleting admins
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                  setFormData({ username: '', password: '', role: 'user' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Kata Sandi {editingUser && '(Kosongkan jika tidak ingin mengubah)'}
                  </label>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Peran
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="user">Pengguna</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    setFormData({ username: '', password: '', role: 'user' });
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-primary-700"
                >
                  {editingUser ? 'Perbarui' : 'Buat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 