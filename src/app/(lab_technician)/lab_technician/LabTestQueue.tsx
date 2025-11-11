import React, { useState, useEffect, useRef, useCallback } from 'react';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import {
  TestTube,
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  HeartPulse,
} from 'lucide-react';

interface LabTestQueueProps {
  onSelectLabReport: (labReportId: string) => void;
  setActiveTab: (tab: 'overview' | 'queue' | 'upload' | 'profile') => void;
}

interface LabReport {
  id: number;
  test_name: string;
  status: string;
  result: string | null;
  created_at: string;
  updated_at: string | null;
  prescription: {
    id: number;
    student_id: number;
    nurse_id: number | null;
    doctor_id: number | null;
    nurse_notes: string | null;
    doctor_notes: string | null;
    created_at: string;
  } | null;
  student: {
    id: number;
    id_number: string;
    name: string;
    branch: string;
    section: string;
    email: string;
  } | null;
}


const LabTestQueue: React.FC<LabTestQueueProps> = ({ onSelectLabReport, setActiveTab }) => {
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastReportRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // --- Fetch Reports ---
  const fetchLabReports = async (reset = false) => {
    if (loading) return;
    if (reset) setInitialLoading(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: reset ? '1' : String(page),
        limit: '10',
        search: searchTerm || '',
        status: filterStatus || 'all',
        date: filterDate || '',
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports/?${params.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      const json = await response.json();
      const data: LabReport[] = json.data || json; // backend or sample fallback

      if (reset) setLabReports(data);
      else setLabReports((prev) => [...prev, ...(data || [])]);

      setHasMore(json.has_more ?? data.length >= 10);
    } catch (error) {
      console.error('Error fetching lab reports:', error);
    } finally {
      if (reset) setInitialLoading(false);
      else setLoading(false);
    }
  };

  // --- Debounced filter + search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchLabReports(true);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm, filterStatus, filterDate]);

  // --- Infinite scroll ---
  useEffect(() => {
    if (page > 1) fetchLabReports();
  }, [page]);

  // --- Initial load ---
  useEffect(() => {
    fetchLabReports(true);
  }, []);

  const handleUploadResults = (reportId: string) => {
    onSelectLabReport(reportId);
    setActiveTab('upload');
  };

  const handleViewDetails = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lab Test Requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Lab Test Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Lab Test Requested':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Lab Test Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (createdAt: string) => {
    const hoursAgo = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursAgo > 24) return 'text-red-600';
    if (hoursAgo > 12) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        {/* Overlay Loader */}
        {initialLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-10">
            <HeartPulse className="w-12 h-12 text-teal-600 animate-pulse" />
            <p className="text-teal-700 font-semibold mt-4">Fetching lab reports...</p>
            <Loader2 className="w-5 h-5 text-teal-500 animate-spin mt-3" />
          </div>
        )}

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <TestTube className="w-6 h-6 mr-3 text-teal-600" />
            Lab Test Queue
          </h2>
          <p className="text-gray-600 mt-2">Process lab test requests and upload results</p>
        </div>

        {/* Search + Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Tests
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name, ID, or test name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="requested">Lab Test Requested</option>
                  <option value="completed">Lab Test Completed</option>
                </select>
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lab Reports ({labReports.length})
            </h3>
          </div>

          {labReports.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No lab reports found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {labReports.map((report, index) => {
                const isLast = index === labReports.length - 1;
                return (
                  <div
                    key={report.id}
                    ref={isLast ? lastReportRef : null}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Patient Info */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{report.student?.name}</h4>
                            <p className="text-sm text-gray-600">ID: {report.student?.id_number}</p>
                            <p className="text-xs text-gray-500">Report: {report.id}</p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Test Details */}
                      <div className="lg:col-span-2">
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Test Name</h5>
                            <p className="text-sm text-gray-900 font-medium">{report.test_name}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Doctor's Notes</h5>
                            <p className="text-sm text-gray-600">{report.prescription?.doctor_notes}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                Requested: {new Date(report.created_at).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>

                            </div>
                            {report.updated_at && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-gray-600">
                                  Completed: {new Date(report.updated_at).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Priority + Actions */}
                      <div className="lg:col-span-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className={`w-4 h-4 ${getPriorityColor(report.created_at)}`} />
                            <span className={`text-sm font-medium ${getPriorityColor(report.created_at)}`}>
                              {(() => {
                                const hoursAgo = (new Date().getTime() - new Date(report.created_at).getTime()) / (1000 * 60 * 60);
                                if (hoursAgo > 24) return 'High Priority';
                                if (hoursAgo > 12) return 'Medium Priority';
                                return 'Normal Priority';
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => report.prescription?.id && handleViewDetails(report.prescription.id.toString())}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {report.status === 'Lab Test Requested' && (
                            <button
                              onClick={() => handleUploadResults(report.id.toString())}
                              className="flex items-center space-x-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors duration-200"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Upload</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex flex-col items-center py-4 text-teal-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm text-gray-600 mt-2">Loading more lab reports...</p>
                </div>
              )}
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

export default LabTestQueue;
