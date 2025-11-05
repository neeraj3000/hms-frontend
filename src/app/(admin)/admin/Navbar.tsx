'use client';

import { useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import LogoutConfirmModal from '@/components/LogoutConfirmModal'; // ✅ adjust this path if needed

interface NavbarProps {
  adminName?: string;
  notificationCount?: number;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export default function Navbar({
  adminName = "Admin User",
  notificationCount = 0,
  onLogout,
  onMenuClick
}: NavbarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Hospital Management System
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
                  Admin Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{adminName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* ✅ Trigger modal here */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ The modal */}
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        highlightText="You will be signed out of your account and redirected to the home page."
      />
    </>
  );
}
