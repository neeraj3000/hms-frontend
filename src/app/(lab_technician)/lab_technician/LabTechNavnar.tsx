import React, { useState } from 'react';
import { 
  TestTube, 
  LayoutDashboard, 
  FileText, 
  Upload, 
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RoleNavbar, { NavItem } from '@/components/RoleNavbar';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

interface LabTechnicianNavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'queue' | 'upload' | 'profile') => void;
}

const LabTechnicianNavbar: React.FC<LabTechnicianNavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState(4); // Sample notification count
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Test Queue', icon: FileText },
    { id: 'upload', label: 'Upload Results', icon: Upload },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabChange = (tabId: 'overview' | 'queue' | 'upload' | 'profile') => {
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
        brandBgClass="bg-teal-600"
        brandIcon={TestTube}
        brandTitle="MediCare HMS"
        brandSubtitle="Lab Technician Dashboard"
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab as 'overview' | 'queue' | 'upload' | 'profile')}
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

export default LabTechnicianNavbar;