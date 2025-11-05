import React, { useState } from 'react';
import StoreKeeperNavbar from './StoreKeeperNavbar';
import StoreKeeperOverview from './StoreKeeperOverview';
import InventoryManagement from './InventoryManagement';
import MaintenanceSchedule from './MaintenanceSchedule';
import StoreKeeperProfile from './StoreKeeperProfile';
import MedicineInventory from '@/app/(pharmacist)/pharmacist/MedicineInventory';
import RequestIndent from './RequestIndent';

const StoreKeeperDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StoreKeeperOverview setActiveTab={setActiveTab} />;
      case 'inventory':
        return <InventoryManagement onSelectItem={setSelectedItemId} />;
      case 'medicine-inventory':
        return <MedicineInventory />;
      case 'indent':
        return <RequestIndent />;
      case 'maintenance':
        return <MaintenanceSchedule />;
      case 'profile':
        return <StoreKeeperProfile />;
      default:
        return <StoreKeeperOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreKeeperNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default StoreKeeperDashboard;