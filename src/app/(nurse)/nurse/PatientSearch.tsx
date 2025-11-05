import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User,
  Clock,
  Eye,
  FileText
} from 'lucide-react';
import getStatusColor from '@/components/getStatusColor';
const PatientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const patients = [
    {
      id: 'R200137',
      name: 'Rajesh Kumar',
      age: 21,
      lastVisit: '2024-01-15',
      status: 'Prescribed by Doctor',
      temperature: '99.2°F',
      chiefComplaint: 'Fever and headache'
    },
    {
      id: 'R200142',
      name: 'Priya Sharma',
      age: 20,
      lastVisit: '2024-01-15',
      status: 'Lab Test Requested',
      temperature: '98.6°F',
      chiefComplaint: 'Stomach pain'
    },
    {
      id: 'R200155',
      name: 'Amit Singh',
      age: 22,
      lastVisit: '2024-01-14',
      status: 'Medication Issued',
      temperature: '97.8°F',
      chiefComplaint: 'Cough and cold'
    },
    {
      id: 'R200168',
      name: 'Sneha Patel',
      age: 19,
      lastVisit: '2024-01-14',
      status: 'Initiated by Nurse',
      temperature: '100.1°F',
      chiefComplaint: 'Throat infection'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || patient.lastVisit === filterDate;
    const matchesStatus = filterStatus === 'all' || patient.status.toLowerCase().includes(filterStatus.toLowerCase());
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Initiated by Nurse':
  //       return 'bg-blue-100 text-blue-800';
  //     case 'Prescribed by Doctor':
  //       return 'bg-green-100 text-green-800';
  //     case 'Lab Test Requested':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'Medication Issued':
  //       return 'bg-emerald-100 text-emerald-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Search className="w-6 h-6 mr-3 text-blue-600" />
            Patient Search
          </h2>
          <p className="text-gray-600 mt-2">Find and view patient records and prescription status</p>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name or Student ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter patient name or student ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
          </div>

          <div className="mt-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <div className="relative max-w-xs">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({filteredPatients.length} patients found)
            </h3>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No patients found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Patient Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-600">ID: {patient.id}</p>
                          <p className="text-sm text-gray-600">Age: {patient.age}</p>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Info */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Chief Complaint:</span>
                          <span className="text-sm text-gray-600">{patient.chiefComplaint}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Temperature:</span>
                          <span className="text-sm text-gray-600">{patient.temperature}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Last Visit:</span>
                          <span className="text-sm text-gray-600">{patient.lastVisit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="mb-3">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
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
    </div>
  );
};

export default PatientSearch;