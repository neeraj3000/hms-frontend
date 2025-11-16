import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  test_name?: string;
  status: string;
  result?: string | null;
  created_at: string;
  updated_at?: string | null;
  prescription?: {
    id: number;
    student_id: string;
    student_name: string;
    doctor_notes: string;
  };
  student?: {
    name: string;
    id_number: string;
  };
};

const LIMIT = 10;

const LabRequests: React.FC = () => {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<any>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setShowModal(true);
  };

  // ====================================================
  // FETCH API (PAGINATED)
  // ====================================================
  const fetchLabRequests = async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setLabRequests([]);
      }

      setLoading(true);

      const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports`);

      url.searchParams.append("page", reset ? "1" : page.toString());
      url.searchParams.append("limit", LIMIT.toString());
      if (searchTerm) url.searchParams.append("search", searchTerm);
      if (filterStatus !== "all") url.searchParams.append("status", filterStatus);
      if (filterDate) url.searchParams.append("date", filterDate);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (reset) {
        setLabRequests(data.data || []);
      } else {
        setLabRequests((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.has_more);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching lab requests:", err);
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL FETCH
  // ====================================================
  useEffect(() => {
    fetchLabRequests(true);
  }, []);

  // ====================================================
  // FILTERS → RESET + REFETCH
  // ====================================================
  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetchLabRequests(true);
    }, 500);

    setTypingTimeout(timeout);
  }, [searchTerm, filterStatus, filterDate]);

  // ====================================================
  // INFINITE SCROLL OBSERVER
  // ====================================================
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setPage((p) => p + 1);
  }, [hasMore, loading]);

  useEffect(() => {
    if (page === 1) return;
    fetchLabRequests(false);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef.current, loadMore]);

  // ====================================================
  // UI COLOR HELPERS
  // ====================================================
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports/${requestId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log("Download error", err);
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
                  <option value="Lab Test Requested">Lab Test Requested</option>
                  <option value="Lab Test Completed">Lab Test Completed</option>
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
              Lab Requests ({labRequests.length})
            </h3>
          </div>

          {labRequests.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No lab requests found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {labRequests.map((request: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Patient Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.student?.name}</h4>
                          <p className="text-sm text-gray-600">ID: {request.student?.id_number}</p>
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
      {/* Infinite Scroll Loader */}
      <div ref={loaderRef} className="h-10 flex justify-center items-center">
        {hasMore && !loading && <p className="text-gray-500">Loading more...</p>}
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