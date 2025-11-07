'use client';

import React, { useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout?.();
  };

  return (
    <>
      <header
        className="
          sticky top-0 z-50
          bg-white
          shadow-md
          border-b border-gray-200
          backdrop-blur-md
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={onMenuClick}
                aria-label="Open menu"
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="truncate">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
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
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Logout: mobile icon */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Logout"
                className="md:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Logout: full button on larger screens */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="hidden md:flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        highlightText="You will be signed out of your account and redirected to the home page."
      />
    </>
  );
}
