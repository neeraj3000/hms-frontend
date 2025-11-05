import React, { useState } from 'react';
import PharmacistNavbar from './PharmacistNavbar';
import PharmacistOverview from './PharmacistOverview';
import PrescriptionQueue from './PrescriptionQueue';
import MedicineInventory from './MedicineInventory';
import IssueMedicine from './IssueMedicine';
import InventoryAnalytics from './InventoryAnalytics';
import PharmacistProfile from './PharmacistProfile';

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PharmacistOverview setActiveTab={setActiveTab} />;
      case 'prescriptions':
        return <PrescriptionQueue onSelectPrescription={setSelectedPrescriptionId} setActiveTab={setActiveTab} />;
      case 'issue-medicine':
        return <IssueMedicine prescriptionId={selectedPrescriptionId} setActiveTab={setActiveTab} />;
      case 'inventory':
        return <MedicineInventory />;
      case 'analytics':
        return <InventoryAnalytics />;
      case 'profile':
        return <PharmacistProfile />;
      default:
        return <PharmacistOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PharmacistNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default PharmacistDashboard;