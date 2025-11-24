import React from "react";
import { FileText } from "lucide-react";
import PrescriptionList from "@/components/PrescriptionList";

interface PrescriptionProps {
  student_id: number | null;
}

const RecentPrescriptions: React.FC<PrescriptionProps> = ({student_id}) => {
  return (
    <div className="p-6">
      <PrescriptionList
        title="Prescription History"
        accentColor="indigo"
        apiEndpoint={`/prescriptions/student/${student_id}`}
        icon={<FileText className="w-6 h-6 mr-3 text-blue-600" />}
      />
    </div>
  );
};

export default RecentPrescriptions;
