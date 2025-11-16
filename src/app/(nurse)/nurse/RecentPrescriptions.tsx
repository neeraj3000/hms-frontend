import React from "react";
import { FileText } from "lucide-react";
import PrescriptionList from "@/components/PrescriptionList";

const RecentPrescriptions = () => {
  return (
    <div className="p-6">
      <PrescriptionList
        title="Prescription History"
        accentColor="blue"
        apiEndpoint="/prescriptions"
        icon={<FileText className="w-6 h-6 mr-3 text-blue-600" />}
      />
    </div>
  );
};

export default RecentPrescriptions;
