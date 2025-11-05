'use client';

import React, { useState } from 'react';
import { LayoutDashboard, User } from 'lucide-react';
import RoleNavbar, { NavItem } from '@/components/RoleNavbar';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  title?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Student Dashboard', activeTab = 'dashboard', setActiveTab }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prescriptions', label: 'Prescriptions', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleSetActive = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <RoleNavbar
        brandBgClass="bg-indigo-600"
        brandIcon={LayoutDashboard}
        brandTitle="MediCare HMS"
        brandSubtitle={title}
        activeTab={activeTab}
        setActiveTab={handleSetActive}
        navItems={navItems}
        notifications={0}
        isMobileMenuOpen={isMobileOpen}
        setIsMobileMenuOpen={setIsMobileOpen}
        onShowLogoutConfirm={() => setShowLogoutConfirm(true)}
      />

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Navbar;
