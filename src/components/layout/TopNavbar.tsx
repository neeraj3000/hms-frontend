'use client';

import React, { useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LogoutConfirmModal from '@/components/LogoutConfirmModal'; // ✅ adjust the path as needed

interface TopNavbarProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
}

export default function TopNavbar({
  title = 'MediCare HMS',
  subtitle = '',
  onMenuClick,
  notificationCount = 0,
}: TopNavbarProps) {
  const { logout } = useAuth?.() ?? {
    logout: () => {
      localStorage.clear();
      window.location.href = '/';
    },
  };

  // ✅ Modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout?.();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* ✅ Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        highlightText="You will be signed out of your account and redirected to the home page."
      />
    </>
  );
}
