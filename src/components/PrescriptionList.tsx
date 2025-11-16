"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Download,
  Pill,
  TestTube,
} from "lucide-react";
import PrescriptionDetailsModal from "@/components/PrescriptionDetailsModal";
import getStatusColor from "@/components/getStatusColor";

type PrescriptionListProps = {
  title: string;
  accentColor: "green" | "blue" | "purple" | "red" | "orange";
  apiEndpoint: string; // Example: "/prescriptions" or "/lab-reports"
  icon?: React.ReactNode;
};

type Medicine = {
  medicine_name?: string;
  quantity_prescribed?: number;
};

type LabReport = {
  test_name?: string;
  status?: string;
};

type Student = {
  id_number?: string;
  name?: string;
  branch?: string;
  section?: string;
  email?: string;
};

type Prescription = {
  id: string | number;
  student?: Student;
  created_at?: string;
  status?: string;
  nurse_notes?: string;
  doctor_notes?: string;
  medicines: Medicine[];
  lab_reports?: LabReport[];
};

const PrescriptionList: React.FC<PrescriptionListProps> = ({
  title,
  accentColor,
  apiEndpoint,
  icon,
}) => {
  // -------------------- STATE --------------------
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  // Modal
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [showModal, setShowModal] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPrescriptionRef = useCallback(
    (node: HTMLDivElement) => {
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

  // Fetch prescriptions from backend
  const fetchPrescriptions = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "10",
        search: searchTerm || "",
        status: filterStatus || "all",
        date: filterDate || "",
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions?${params}`
      );
      const result = await res.json();

      if (reset) {
        setPrescriptions(result.data || []);
      } else {
        setPrescriptions((prev) => [...prev, ...(result.data || [])]);
      }

      setHasMore(result.has_more);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset prescriptions when filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchPrescriptions(true);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm, filterStatus, filterDate]);

  // Infinite scroll fetch
  useEffect(() => {
    if (page > 1) fetchPrescriptions();
  }, [page]);

  const handleViewDetails = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    setShowModal(true);
  };

  const downloadPrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}/download`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prescription-${prescriptionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading prescription:", error);
      alert(
        "Download functionality will be implemented with backend integration"
      );
    }
  };

  // -------------------- COMPONENT UI --------------------
  const color = accentColor;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className={clsx("w-6 h-6 mr-3", `text-${color}-600`)} />
            {title}
          </h2>
          <p className="text-gray-600 mt-2">
            View and manage all your prescribed treatments
          </p>
        </div>

        {/* Search & Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                  className={clsx(
                    "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
                    `focus:ring-${color}-500`
                  )}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filter by Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={clsx(
                    "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent appearance-none",
                    `focus:ring-${color}-500`
                  )}
                >
                  <option value="all">All Status</option>
                  <option value="initiated">Initiated by Nurse</option>
                  <option value="prescribed">
                    Medication Prescribed by Doctor
                  </option>
                  <option value="prescribed_lab">
                    Medication Prescribed and Lab Test Requested
                  </option>
                  <option value="issued">
                    Medication Issued by Pharmacist
                  </option>
                  <option value="issued_lab">
                    Medication Issued and Lab Test Requested
                  </option>
                  <option value="lab_requested">Lab Test Requested</option>
                  <option value="lab_completed">Lab Test Completed</option>
                  <option value="issued_completed">
                    Medication Issued and Lab Test Completed
                  </option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filter by Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={clsx(
                    "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
                    `focus:ring-${color}-500`
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prescription List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Prescriptions ({prescriptions.length})
            </h3>
          </div>

          {prescriptions.length === 0 && !loading ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No prescriptions found matching your criteria
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription: any, index) => {
                const isLast = index === prescriptions.length - 1;
                return (
                  <div
                    key={prescription.id}
                    ref={isLast ? lastPrescriptionRef : null}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1">
                        <div className="flex items-center space-x-3">
                          <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center", `bg-${color}-100`)}>
                            <User className={clsx("w-6 h-6", `text-${color}-600`)} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {prescription.student?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ID: {prescription.student?.id_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              PRX: {prescription.id}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              prescription.status
                            )}`}
                          >
                            {prescription.status}
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <div className="space-y-4">
                          {prescription?.doctor_notes && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700">
                                Doctor's Notes
                              </h5>
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {prescription.doctor_notes}
                              </p>
                            </div>
                          )}

                          {prescription?.nurse_notes && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700">
                                Nurse's Notes
                              </h5>
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {prescription.nurse_notes}
                              </p>
                            </div>
                          )}

                          {prescription?.medicines?.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 flex items-center mb-1">
                                <Pill className="w-4 h-4 mr-1" />
                                Medicines ({prescription.medicines.length})
                              </h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                {prescription.medicines.map(
                                  (med: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between border-b border-gray-100 py-1"
                                    >
                                      <span
                                        className="truncate max-w-[250px]"
                                        title={med.medicine_name}
                                      >
                                        {med.medicine_name}
                                      </span>
                                      <span className="text-gray-700 font-medium">
                                        Qty: {med.quantity_prescribed}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {prescription?.lab_reports?.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                <TestTube className="w-4 h-4 mr-1" />
                                Lab Reports ({prescription.lab_reports.length})
                              </h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                {prescription.lab_reports.map(
                                  (report: any, idx: number) => (
                                    <div key={idx}>
                                      • {report.test_name} ({report.status})
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-1 flex flex-col justify-between">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-1 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                prescription.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() =>
                              handleViewDetails(prescription.id.toString())
                            }
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() =>
                              downloadPrescription(prescription.id)
                            }
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                          >
                            <Download className="w-4 h-4" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <p className="text-center text-gray-500">Loading more...</p>
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

export default PrescriptionList;
