import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Search, 
  Filter, 
  Calendar,
  User,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';

type LabRequest = {
  id: string | number;
  prescription_id?: number;
  test_name?: string;
  status: string;
  result?: string | null;
  created_at: string;
  updated_at?: string | null;
  prescription?: {
    student_id: string;
    student_name: string;
    doctor_notes: string;
  };
  patientName?: string;
  studentId?: string;
  requestDate?: string;
  requestTime?: string;
  completedDate?: string | null;
  completedTime?: string | null;
  tests?: string[];
  results?: any[];
  diagnosis?: string;
  doctorNotes?: string;
  priority?: string;
};

const LabRequests: React.FC = () => {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LabRequest[]>([]);
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
    fetchLabRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [labRequests, searchTerm, filterStatus, filterDate]);

  const fetchLabRequests = async () => {
    try {
      // Fetch lab reports for the doctor
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLabRequests(data);
        console.log("Lab requests: ", data)
      }
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      // Sample data for demo
      const sampleRequests = [
        {
          id: 1,
          prescription_id: 2,
          test_name: 'Complete Blood Count',
          status: 'Lab Test Completed',
          result: 'reports/cbc_report.pdf',
          created_at: '2024-01-15T11:15:00Z',
          updated_at: '2024-01-16T14:30:00Z',
          prescription: {
            student_id: 'R200142',
            student_name: 'Priya Sharma',
            doctor_notes: 'Patient complains of stomach pain. Ordered lab tests to rule out infection.'
          }
        },
        {
          id: 2,
          prescription_id: 3,
          test_name: 'Blood Sugar Test',
          status: 'Lab Test Requested',
          result: null,
          created_at: '2024-01-16T09:15:00Z',
          updated_at: null,
          prescription: {
            student_id: 'R200180',
            student_name: 'Vikram Reddy',
            doctor_notes: 'Patient reports feeling weak for past week. Check for diabetes.'
          }
        },
        {
          id: 'LAB-003',
          patientName: 'Anita Patel',
          studentId: 'R200195',
          requestDate: '2024-01-16',
          requestTime: '10:45 AM',
          status: 'Pending',
          completedDate: null,
          completedTime: null,
          tests: ['Urine Analysis', 'Kidney Function Test'],
          results: [],
          diagnosis: 'Urinary tract infection suspected',
          doctorNotes: 'Patient has burning sensation during urination. UTI suspected.',
          priority: 'medium',
          created_at: '2024-01-16T10:45:00Z'
        }
      ];
      setLabRequests(sampleRequests);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (!Array.isArray(labRequests)) {
      setFilteredRequests([]);
      return;
    }

    const search = (searchTerm || "").toLowerCase();

    const filtered = labRequests.filter((request: any) => {
      const studentName = request?.prescription?.student_name?.toString().toLowerCase() || "";
      const studentId = request?.prescription?.student_id?.toString().toLowerCase() || "";
      const reqId = request?.id?.toString().toLowerCase() || "";

      const matchesSearch =
        studentName.includes(search) ||
        studentId.includes(search) ||
        reqId.includes(search);

      const matchesStatus =
        filterStatus === "all" ||
        (request?.status || "").toString().toLowerCase() === filterStatus.toLowerCase();

      const matchesDate =
        !filterDate || (request?.created_at?.split?.("T")[0] === filterDate);

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by date (newest first). fallback to 0 if missing
    filtered.sort(
      (a: any, b: any) =>
        new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
    );

    setFilteredRequests(filtered);
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lab test completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lab test requested':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'lab test completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'lab test requested':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const downloadReport = async (requestId: string, fileName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports/${requestId}/download`, {
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
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
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
            <TestTube className="w-6 h-6 mr-3 text-purple-600" />
            Lab Requests & Results
          </h2>
          <p className="text-gray-600 mt-2">Track lab test requests and view results</p>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Lab Requests
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name, ID, or lab ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lab Requests List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lab Requests ({filteredRequests.length})
            </h3>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No lab requests found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Patient Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.prescription?.student.name}</h4>
                          <p className="text-sm text-gray-600">ID: {request.prescription?.student.id_number}</p>
                          <p className="text-xs text-gray-500">LAB: {request.id}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Test Name</h5>
                          <p className="text-sm text-gray-600">{request.test_name}</p>
                        </div>
                        
                        {request.result && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Result Available</h5>
                            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-700">Report Ready</span>
                              </div>
                              <button
                                onClick={() => downloadReport(request.id, request.result)}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors duration-200"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Prescription Notes:</h5>
                          <p className="text-sm text-gray-600">{request.prescription?.doctor_notes}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timing and Actions */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <h6 className="font-medium text-gray-700">Requested</h6>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {request.updated_at && (
                          <div>
                            <h6 className="font-medium text-gray-700">Completed</h6>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(request.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <button onClick={() => handleViewDetails(request.prescription.id.toString())}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors duration-200 w-full justify-center">
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
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

export default LabRequests;