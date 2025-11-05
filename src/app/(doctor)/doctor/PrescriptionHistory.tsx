import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  User,
  Eye,
  Download,
  Pill,
  TestTube
} from 'lucide-react';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import getStatusColor from '@/components/getStatusColor';
type Medicine = {
  medicine_name?: string;
  quantity_prescribed?: number;
  name?: string;
  quantity?: number;
  instructions?: string;
};

type LabReport = {
  test_name?: string;
  status?: string;
};

type Prescription = {
  id: string | number;
  student_id?: string;
  student_name?: string;
  created_at?: string;
  status?: string;
  notes?: string;
  medicines: Medicine[];
  lab_reports?: LabReport[];
  patientName?: string;
  studentId?: string;
  date?: string;
  time?: string;
  diagnosis?: string;
  labTests?: LabReport[];
  doctorNotes?: string;
};

const PrescriptionHistory: React.FC = () => {
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
    fetchPrescriptionHistory();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, filterStatus, filterDate]);

  const fetchPrescriptionHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
        console.log('Fetched prescriptions:', data);
      }
    } catch (error) {
      console.error('Error fetching prescription history:', error);
      // Sample data for demo
      const samplePrescriptions = [
        {
          id: 1,
          student_id: 'R200137',
          student_name: 'Rajesh Kumar',
          created_at: '2024-01-15T10:30:00Z',
          status: 'Medication Issued by Pharmacist',
          notes: 'Patient presented with high fever and severe headache. Prescribed symptomatic treatment.',
          medicines: [
            { medicine_name: 'Paracetamol 500mg', quantity_prescribed: 10 },
            { medicine_name: 'Ibuprofen 400mg', quantity_prescribed: 6 }
          ],
          lab_reports: []
        },
        {
          id: 2,
          student_id: 'R200142',
          student_name: 'Priya Sharma',
          created_at: '2024-01-15T11:15:00Z',
          status: 'Lab Test Completed',
          notes: 'Patient complains of stomach pain. Ordered lab tests to rule out infection.',
          medicines: [],
          lab_reports: [
            { test_name: 'Complete Blood Count', status: 'Lab Test Completed' },
            { test_name: 'Stool Examination', status: 'Lab Test Completed' }
          ]
        },
        {
          id: 'PRX-003',
          patientName: 'Amit Singh',
          studentId: 'R200155',
          date: '2024-01-14',
          time: '2:45 PM',
          status: 'Medication Issued by Pharmacist',
          diagnosis: 'Upper respiratory tract infection',
          medicines: [
            { name: 'Amoxicillin 250mg', quantity: 15, instructions: 'Take 1 capsule three times daily' },
            { name: 'Cetirizine 10mg', quantity: 7, instructions: 'Take 1 tablet at bedtime' }
          ],
          labTests: [],
          doctorNotes: 'Common cold with mild throat infection. Prescribed antibiotic course.'
        }
      ];
      setPrescriptions(samplePrescriptions);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    const filtered = prescriptions.filter((prescription: any) => {
      const searchTermLower = searchTerm.toLowerCase();

      // Convert id to string for comparison
      const idStr = prescription?.id?.toString() || "";

      const matchesSearch =
        (prescription?.student_name?.toLowerCase().includes(searchTermLower) ?? false) ||
        (prescription?.student_id?.toLowerCase().includes(searchTermLower) ?? false) ||
        idStr.includes(searchTermLower);

      const matchesStatus =
        filterStatus === 'all' ||
        (prescription?.status?.toLowerCase().includes(filterStatus.toLowerCase()) ?? false);

      const matchesDate =
        !filterDate ||
        (prescription?.created_at?.split('T')[0] === filterDate);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by creation date (newest first)
    filtered.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredPrescriptions(filtered);
  };


  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Prescribed by Doctor':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     case 'Lab Test Requested':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'Lab Test Completed':
  //       return 'bg-purple-100 text-purple-800 border-purple-200';
  //     case 'Medication Issued by Pharmacist':
  //       return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  const downloadPrescription = async (prescriptionId: string) => {
    try {
      // Sample API call - replace with your endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}/download`, {
        method: 'GET',
        // headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        // }, 
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${prescriptionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading prescription:', error);
      alert('Download functionality will be implemented with backend integration');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-48">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
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
            <FileText className="w-6 h-6 mr-3 text-green-600" />
            Prescription History
          </h2>
          <p className="text-gray-600 mt-2">View and manage all your prescribed treatments</p>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Prescriptions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name, ID, or prescription ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
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
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Prescriptions ({filteredPrescriptions.length})
            </h3>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No prescriptions found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPrescriptions.map((prescription: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Patient Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{prescription.student.name}</h4>
                          <p className="text-sm text-gray-600">ID: {prescription.student.id_number}</p>
                          <p className="text-xs text-gray-500">PRX: {prescription.id}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>
                    </div>

                    {/* Prescription Details */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Doctor's Notes</h5>
                          <p className="text-sm text-gray-600">{prescription.notes}</p>
                        </div>
                        
                        {prescription?.medicines?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 flex items-center">
                              <Pill className="w-4 h-4 mr-1" />
                              Medicines ({prescription.medicines.length})
                            </h5>
                            <div className="text-sm text-gray-600">
                              {prescription.medicines.map((med: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{med.medicine_name}</span>
                                  <span>Qty: {med.quantity_prescribed}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prescription?.lab_reports?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 flex items-center">
                              <TestTube className="w-4 h-4 mr-1" />
                              Lab Reports ({prescription.lab_reports.length})
                            </h5>
                            <div className="text-sm text-gray-600">
                              {prescription.lab_reports.map((report: any, idx: number) => (
                                <div key={idx}>• {report.test_name} ({report.status})</div>
                              ))}
                            </div>
                          </div>  
                        )}
                      </div>
                    </div>

                    {/* Date and Actions */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(prescription.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button onClick={() => handleViewDetails(prescription.id.toString())}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => downloadPrescription(prescription.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
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

export default PrescriptionHistory;