import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  User,
  Eye,
  Pill,
  CheckCircle,
  Clock
} from 'lucide-react';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import getStatusColor from '@/components/getStatusColor';
import getStatusIcon from '@/components/getStatusIcon';

interface PrescriptionQueueProps {
  onSelectPrescription: (prescriptionId: string) => void;
  setActiveTab: (tab: string) => void;
}

interface Medicine {
  id: number;
  medicine: {
    id: number;
    name: string;
    category: string;
    quantity: number;
  };
  medicine_name: string;
  quantity_prescribed: number;
  quantity_issued: number | null;
}

interface Prescription {
  medicines: any;
  student: any;
  id: number;
  student_id: string;
  student_details: {
    name: string;
    branch: string | null;
    section: string | null;
  };
  created_at: string;
  status: string;
  notes: string;
  medicines_list: Medicine[];
  lab_reports_list: any[];
}

const PrescriptionQueue: React.FC<PrescriptionQueueProps> = ({ onSelectPrescription, setActiveTab }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setShowModal(true);
  };

  useEffect(() => {
    fetchPrescriptionQueue();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, filterStatus, filterDate]);

  const fetchPrescriptionQueue = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Prescriptions: ", data);
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescription queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions.filter((prescription) => {
      const studentName = prescription.student_details?.name || '';
      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.student_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || prescription.status.toLowerCase().includes(filterStatus.toLowerCase());
      const matchesDate = !filterDate || prescription.created_at.split('T')[0] === filterDate;

      return matchesSearch && matchesStatus && matchesDate;
    });

    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredPrescriptions(filtered);
  };

  const handleViewPrescription = (prescriptionId: string) => {
    onSelectPrescription(prescriptionId);
    setActiveTab('issue-medicine');
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Prescribed by Doctor':
  //       return 'bg-blue-100 text-blue-800 border-blue-200';
  //     case 'Medication Issued by Pharmacist':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'Prescribed by Doctor':
  //       return <Clock className="w-4 h-4 text-blue-600" />;
  //     case 'Medication Issued by Pharmacist':
  //       return <CheckCircle className="w-4 h-4 text-green-600" />;
  //     default:
  //       return <Clock className="w-4 h-4 text-gray-600" />;
  //   }
  // };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-purple-600" />
            Prescription Queue
          </h2>
          <p className="text-gray-600 mt-2">Review and process prescriptions from doctors</p>
        </div>

        {/* Search & Filter */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Prescriptions</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name or ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="initiated">Initiated by Nurse</option>
                  <option value="prescribed">Medication Prescribed by Doctor</option>
                  <option value="prescribed_lab">Medication Prescribed and Lab Test Requested</option>
                  <option value="issued">Medication Issued by Pharmacist</option>
                  <option value="issued_lab">Medication Issued and Lab Test Requested</option>
                  <option value="lab_requested">Lab Test Requested</option>
                  <option value="lab_completed">Lab Test Completed</option>
                  <option value="issued_completed">Medication Issued and Lab Test Completed</option>
                  <option value="prescribed_completed">Medication Prescribed and Lab Test Completed</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prescription List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Prescriptions ({filteredPrescriptions.length})
            </h3>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No prescriptions found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Student Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {prescription.student?.name || "Unknown"}
                          </h4>
                          <p className="text-sm text-gray-600">ID: {prescription.student.id_number}</p>
                          <p className="text-xs text-gray-500">PRX: {prescription.id}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            prescription.status
                          )}`}
                        >
                          {getStatusIcon(prescription.status)}
                          <span className="ml-1">{prescription.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Notes & Medicines */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Doctor's Notes</h5>
                          <p className="text-sm text-gray-600">{prescription.notes || 'No notes'}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 flex items-center">
                            <Pill className="w-4 h-4 mr-1" />
                            Prescribed Medicines ({prescription?.medicines?.length || 0})
                          </h5>
                          <div className="space-y-1">
                            {prescription.medicines?.map((med: Medicine, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-gray-600">
                                  {med?.medicine_name || "Unknown Medicine"}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 font-medium">
                                    Qty: {med?.quantity_prescribed ?? 0}
                                  </span>
                                  {med?.quantity_issued ? (
                                    <span className="text-green-600 text-xs">
                                      (Issued: {med.quantity_issued})
                                    </span>
                                  ) : (
                                    <span className="text-blue-600 text-xs">(Pending)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date & Button */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(prescription.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full justify-center">
                        {/* View Details button */}
                        <button
                          onClick={() => handleViewDetails(prescription.id.toString())}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-medium rounded-xl shadow-md transition-all duration-200 w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>

                        {/* Conditional render for Issue Medicine or Issued badge */}
                        {prescription.medicines.some((med: { quantity_issued: number; }) => med.quantity_issued && med.quantity_issued > 0) ? (
                          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-xl border border-green-200 shadow-sm w-full sm:w-auto">
                            <span>✅ Medicine Issued</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleViewPrescription(prescription.id.toString())}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl shadow-md transition-all duration-200 w-full sm:w-auto"
                          >
                            <span>💊 Issue Medicine</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PrescriptionDetailsModal
        prescriptionId={selectedPrescriptionId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default PrescriptionQueue;
