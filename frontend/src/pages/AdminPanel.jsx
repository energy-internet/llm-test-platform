// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserGroupIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { apiClient } from '../utils/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/admin/users').then(res => res.data)
  });

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats').then(res => res.data)
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => 
      apiClient.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => apiClient.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const handleRoleChange = (userId, newRole) => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      user: 'badge-info'
    };
    return badges[role] || 'badge-info';
  };

  const tabs = [
    { id: 'users', name: 'Users', icon: UserGroupIcon },
    { id: 'system', name: 'System', icon: CogIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <ShieldCheckIcon className="h-8 w-8 text-red-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            System administration and user management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <div className="card-body">
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">User</th>
                        <th className="table-header-cell">Email</th>
                        <th className="table-header-cell">Role</th>
                        <th className="table-header-cell">Created</th>
                        <th className="table-header-cell">Last Active</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="table-cell">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{user.username}</span>
                            </div>
                          </td>
                          <td className="table-cell">{user.email}</td>
                          <td className="table-cell">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="form-select w-auto"
                              disabled={updateUserRoleMutation.isLoading}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="table-cell">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="table-cell">
                            {user.last_login ? 
                              new Date(user.last_login).toLocaleDateString() : 
                              'Never'
                            }
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                disabled={deleteUserMutation.isLoading}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.total_users || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats?.active_tests || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Tests</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemStats?.total_evaluations || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Evaluations</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {systemStats?.system_uptime || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">System Information</h3>
                </div>
                <div className="card-body">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">API Version</dt>
                      <dd className="mt-1 text-sm text-gray-900">{systemStats?.api_version || 'v1.0.0'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Database Status</dt>
                      <dd className="mt-1">
                        <span className="badge badge-success">Connected</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Cache Status</dt>
                      <dd className="mt-1">
                        <span className="badge badge-success">Operational</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Queue Status</dt>
                      <dd className="mt-1">
                        <span className="badge badge-success">Processing</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;