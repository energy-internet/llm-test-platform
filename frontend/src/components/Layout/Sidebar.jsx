// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  CpuChipIcon,
  DocumentTextIcon,
  PlayIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Model Providers', href: '/models', icon: CpuChipIcon },
    { name: 'Benchmarks', href: '/benchmarks', icon: DocumentTextIcon },
    { name: 'Tests', href: '/tests', icon: PlayIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  ];

  // Add admin menu for admin users
  if (user?.role === 'admin') {
    navigation.push(
      { name: 'Admin Panel', href: '/admin', icon: UserGroupIcon }
    );
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5 transition-colors duration-200`}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User info at bottom */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {user?.username || 'User'}
            </p>
            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 capitalize">
              {user?.role || 'user'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;