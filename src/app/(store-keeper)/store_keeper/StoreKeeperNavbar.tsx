import React, { useState } from 'react';
import { 
  Package, 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RoleNavbar, { NavItem } from '@/components/RoleNavbar';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

interface StoreKeeperNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StoreKeeperNavbar: React.FC<StoreKeeperNavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState(6); // Sample notification count
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'medicine-inventory', label: 'Medicine Inventory', icon: Package },
    { id: 'indent', label: 'Request Indent', icon: BarChart3 },
    // { id: 'maintenance', label: 'Maintenance', icon: Wrench },
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
    <div className="w-full max-w-full">
      <RoleNavbar
        brandBgClass="bg-orange-600"
        brandIcon={Package}
        brandTitle="MediCare HMS"
        brandSubtitle="Store Keeper Dashboard"
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
    </div>
  );
};

export default StoreKeeperNavbar;