const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Initiated by Nurse':
      return 'bg-blue-100 text-blue-800';

    case 'Medication Prescribed by Doctor':
    case 'Medication Prescribed and Lab Test Requested':
    case 'Medication Prescribed and Lab Test Completed': // new
      return 'bg-green-100 text-green-800';

    case 'Medication Issued by Pharmacist':
    case 'Medication issued and Lab Test Requested':
    case 'Medication issued and Lab Test Completed':
      return 'bg-emerald-100 text-emerald-800';

    case 'Lab Test Requested':
      return 'bg-yellow-100 text-yellow-800';

    case 'Lab Test Completed':
      return 'bg-purple-100 text-purple-800';

    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default getStatusColor;
