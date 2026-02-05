import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// ...existing code...
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminUsers = () => {
  // ...existing code...
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, faculty, student, pending, approved, blocked

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://eduspark-nxre.onrender.com/api/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`https://eduspark-nxre.onrender.com/api/auth/users/${userId}/status`, { status: newStatus });
      // Update local state
      setUsers(users.map(u =>
        u._id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`https://eduspark-nxre.onrender.com/api/auth/users/${userId}`);
        // Remove user from local state
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'faculty') return user.role === 'faculty';
    if (filter === 'student') return user.role === 'student';
    return user.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 User Management
          </h1>
          <p className="text-gray-600">Manage all registered users on the platform.</p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Users', count: users.length },
              { key: 'faculty', label: 'Faculty', count: users.filter(u => u.role === 'faculty').length },
              { key: 'student', label: 'Students', count: users.filter(u => u.role === 'student').length },
              { key: 'pending', label: 'Pending', count: users.filter(u => u.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: users.filter(u => u.status === 'approved').length },
              { key: 'blocked', label: 'Blocked', count: users.filter(u => u.status === 'blocked').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {userData.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userData.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : userData.role === 'faculty'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(userData.status)}`}>
                        {userData.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {userData.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUserStatusChange(userData._id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUserStatusChange(userData._id, 'blocked')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Block
                            </button>
                          </>
                        )}
                        {userData.status === 'approved' && (
                          <button
                            onClick={() => handleUserStatusChange(userData._id, 'blocked')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Block
                          </button>
                        )}
                        {userData.status === 'blocked' && (
                          <button
                            onClick={() => handleUserStatusChange(userData._id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Unblock
                          </button>
                        )}
                        {userData.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(userData._id, userData.name)}
                            className="text-red-600 hover:text-red-900 ml-2"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <span className="text-4xl mb-4 block">👥</span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No users found</h4>
              <p className="text-gray-500">No users match the selected filter.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsers;
