import React, { useState } from 'react';
import LabTechnicianNavbar from './LabTechNavnar';
import LabTechnicianOverview from './LabTechOverview';
import LabTestQueue from './LabTestQueue';
import UploadResults from './UploadResults';
import LabTechnicianProfile from './LabTechProfile';
import Profile from '@/components/Profile';

const LabTechnicianDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'upload' | 'profile'>('queue');
  const [selectedLabReportId, setSelectedLabReportId] = useState<string | null>(null);

  const handleSelectLabReport = (reportId: string) => {
    setSelectedLabReportId(reportId);
    setActiveTab('upload');
  };

  const handleUploadComplete = () => {
    setSelectedLabReportId(null);
    setActiveTab('queue'); // go back to queue after upload
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <LabTechnicianOverview setActiveTab={setActiveTab} />;
      case 'queue':
        return <LabTestQueue
          onSelectLabReport={handleSelectLabReport}
          setActiveTab={setActiveTab}
        />;
      case 'upload':
        return <UploadResults
          labReportId={selectedLabReportId}
          onUploadComplete={handleUploadComplete}
        />;
      case 'profile':
        return <Profile color="teal" />;
      default:
        return <LabTechnicianOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LabTechnicianNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default LabTechnicianDashboard;
