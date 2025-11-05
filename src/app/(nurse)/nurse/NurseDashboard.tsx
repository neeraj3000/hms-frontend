import React, { useState } from 'react';
import Navbar from './Navbar';
import DashboardOverview from './DashboardOverview';
import PatientRegistration from './PatientRegistration';
import PatientSearch from './PatientSearch';
import RecentPrescriptions from './RecentPrescriptions';
import Profile from './Profile';

const NurseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('register');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'register':
        return <PatientRegistration />;
      case 'search':
        return <PatientSearch />;
      case 'prescriptions':
        return <RecentPrescriptions />;
      case 'profile':
        return <Profile />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default NurseDashboard;