import React, { useState } from 'react';
import DoctorNavbar from './DoctorNavbar';
import DoctorOverview from './DoctorOverview';
import PatientQueue from './PatientQueue';
import PatientDetails from './PatientDetails';
import PrescriptionHistory from './PrescriptionHistory';
import LabRequests from './LabRequests';
import DoctorProfile from './DoctorProfile';
import Profile from '@/components/Profile';

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DoctorOverview setActiveTab={setActiveTab} />;
      case 'queue':
        return <PatientQueue onSelectPatient={setSelectedPrescriptionId} setActiveTab={setActiveTab} />;
      case 'patient-details':
        return <PatientDetails prescriptionId={selectedPrescriptionId} setActiveTab={setActiveTab}/>;
      case 'prescriptions':
        return <PrescriptionHistory />;
      case 'lab-requests':
        return <LabRequests />;
      case 'profile':
        return <Profile color="green" />;
      default:
        return <DoctorOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorDashboard;