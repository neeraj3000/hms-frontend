import { Clock, CheckCircle, FlaskConical, Pill, Stethoscope } from 'lucide-react';
import React from 'react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Initiated by Nurse':
      return <Stethoscope className="w-4 h-4 text-blue-600" />;

    case 'Medication Prescribed by Doctor':
    case 'Medication Prescribed and Lab Test Requested':
      return <Pill className="w-4 h-4 text-green-600" />;

    case 'Medication Issued by Pharmacist':
    case 'Medication issued and Lab Test Requested':
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;

    case 'Lab Test Requested':
      return <FlaskConical className="w-4 h-4 text-yellow-600" />;

    case 'Lab Test Completed':
    case 'Medication issued and Lab Test Completed':
      return <CheckCircle className="w-4 h-4 text-purple-600" />;

    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

export default getStatusIcon;
