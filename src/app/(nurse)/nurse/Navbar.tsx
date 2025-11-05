'use client';

import React, { useState } from 'react';
import { Stethoscope, LayoutDashboard, UserPlus, Search, FileText, User } from 'lucide-react';
import RoleNavbar, { NavItem } from '@/components/RoleNavbar';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'New Patient', icon: UserPlus },
    { id: 'search', label: 'Search Patient', icon: Search },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <RoleNavbar
        brandBgClass="bg-blue-600"
        brandIcon={Stethoscope}
        brandTitle="MediCare HMS"
        brandSubtitle="Nurse Dashboard"
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        navItems={navItems}
        notifications={2}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
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
