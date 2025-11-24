import React, { useState, useEffect } from 'react';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import { 
  Users, 
  Search, 
  Filter, 
  Clock, 
  User,
  Eye,
  AlertTriangle,
  Calendar,
  Thermometer
} from 'lucide-react';

interface PatientQueueProps {
  onSelectPatient: (patientId: string) => void;
  setActiveTab: (tab: string) => void;
}

type Prescription = {
  id: string | number;
  student_id?: string;
  student_name?: string;
  student_age?: number;
  created_at?: string;
  status?: string;
  doctor_notes?: string;
  temperature?: string;
  bp?: string;
  weight?: string;
  name?: string;
  age?: number;
  studentId?: string;
  arrivalTime?: string;
  waitTime?: string;
  priority?: string;
  chiefComplaint?: string;
  vitals?: {
    temperature?: string;
    bp?: string;
    pulse?: string;
  };
  nurse_notes?: string;
};

const PatientQueue: React.FC<PatientQueueProps> = ({ onSelectPatient, setActiveTab }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptionQueue();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, filterStatus]);

  const fetchPrescriptionQueue = async () => {
    try {
      // Fetch prescriptions that need doctor attention
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/pending`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched prescriptions:', data);
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescription queue:', error);
      // Sample data for demo
      const samplePrescriptions = [
        {
          id: 1,
          student_id: 'R200137',
          student_name: 'Rajesh Kumar',
          student_age: 21,
          created_at: '2024-01-15T10:30:00Z',
          status: 'Initiated by Nurse',
          doctor_notes: 'Severe headache and fever',
          temperature: '102.1°F',
          bp: '140/90',
          weight: '68kg'
        },
        {
          id: 2,
          student_id: 'R200142',
          student_name: 'Priya Sharma',
          student_age: 20,
          created_at: '2024-01-15T11:15:00Z',
          status: 'Lab Test Completed',
          doctor_notes: 'Stomach pain and nausea',
          temperature: '99.1°F',
          bp: '120/80',
          weight: '55kg'
        },
        {
          id: 'R200168',
          name: 'Sneha Patel',
          age: 19,
          studentId: 'R200168',
          arrivalTime: '12:20 PM',
          waitTime: '5 min',
          status: 'Initiated by Nurse',
          priority: 'medium',
          chiefComplaint: 'Throat infection and difficulty swallowing',
          vitals: { temperature: '100.8°F', bp: '115/75', pulse: '82' },
          nurse_notes: 'Throat appears inflamed, moderate fever'
        }
      ];
      setPrescriptions(samplePrescriptions);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    const filtered = prescriptions
      .filter((prescription: any) => {
        const studentName = prescription.student_name?.toLowerCase() || "";
        const studentId = prescription.student_id?.toString().toLowerCase() || "";
        const status = prescription.status?.toLowerCase() || "";

        const matchesSearch =
          studentName.includes(searchTerm.toLowerCase()) ||
          studentId.includes(searchTerm.toLowerCase());

        const matchesStatus =
          filterStatus === "all" || status.includes(filterStatus.toLowerCase());

        return matchesSearch && matchesStatus;
      })
      // ✅ Sort by creation date (newest first)
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    setFilteredPrescriptions(filtered);
  };


  const handleViewPatient = (prescriptionId: string) => {
    onSelectPatient(prescriptionId);
    setActiveTab('patient-details');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Initiated by Nurse':
        return 'bg-blue-100 text-blue-800';
      case 'Lab Test Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Lab Test Requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-3 text-green-600" />
            Patient Queue
          </h2>
          <p className="text-gray-600 mt-2">Review and manage patients waiting for consultation</p>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Patients
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or student ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
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
                  <option value="lab">Lab Test Completed</option>
                  <option value="requested">Lab Test Requested</option>
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="priority"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Prescriptions in Queue ({filteredPrescriptions.length})
            </h3>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No prescriptions found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Patient Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{prescription?.student?.name || prescription?.other_name}</h4>
                          <p className="text-sm text-gray-600">ID: {prescription?.student?.id_number || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Age: {prescription?.age}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timing Info */}
                    <div className="lg:col-span-1">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Created: {new Date(prescription.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Info */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Nurse Notes</h5>
                          <p className="text-sm text-gray-600">{prescription.nurse_notes}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Thermometer className="w-4 h-4" />
                            <span>{prescription.temperature || 'N/A'}</span>
                          </div>
                          <span>BP: {prescription.bp || 'N/A'}</span>
                          <span>Weight: {prescription.weight || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>
                      <div className="mt-4">
                        <button 
                          onClick={() => handleViewPatient(prescription.id.toString())}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200 w-full justify-center"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review Prescription</span>
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
    </ResponsiveContainer>
  );
};

export default PatientQueue;