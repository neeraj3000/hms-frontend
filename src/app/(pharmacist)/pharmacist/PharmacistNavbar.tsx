import React, { useState } from 'react';
import { 
  Pill, 
  LayoutDashboard, 
  FileText, 
  Package, 
  BarChart3, 
  User,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RoleNavbar, { NavItem } from '@/components/RoleNavbar';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

interface PharmacistNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PharmacistNavbar: React.FC<PharmacistNavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState(5); // Sample notification count
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Sample API call - replace with your endpoint
    const logoutUser = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          // Clear local storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
          sessionStorage.clear();
          
          // Redirect to home (login modal on home)
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API fails
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    };
    
    logoutUser();
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <RoleNavbar
        brandBgClass="bg-purple-600"
        brandIcon={Pill}
        brandTitle="MediCare HMS"
        brandSubtitle="Pharmacist Dashboard"
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        navItems={navItems}
        notifications={notifications}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onShowLogoutConfirm={() => setShowLogoutConfirm(true)}
      />
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        highlightText="You will be signed out of your account and redirected to the home page."
      />
    </>
  );
};

export default PharmacistNavbar;