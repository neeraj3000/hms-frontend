// PrescriptionQueue.tsx
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
  Pill,
  CheckCircle,
  Clock,
} from "lucide-react";
import PrescriptionDetailsModal from "@/components/PrescriptionDetailsModal";
import getStatusColor from "@/components/getStatusColor";
import getStatusIcon from "@/components/getStatusIcon";

type Medicine = {
  medicine_name?: string;
  quantity_prescribed?: number;
  quantity_issued?: number | null;
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
  id: number | string;
  student?: Student | null;
  other_name?: string | null;
  created_at?: string;
  status?: string;
  notes?: string;
  nurse_notes?: string;
  doctor_notes?: string;
  medicines?: Medicine[];
  lab_reports?: LabReport[];
  patient_type?: "student" | "others";
  visit_type?: "normal" | "emergency";
};

const PAGE_LIMIT = 10;

interface Props {
  onSelectPrescription: (prescriptionId: string) => void;
  setActiveTab: (tab: string) => void;
}

const PrescriptionQueue: React.FC<Props> = ({ onSelectPrescription, setActiveTab }) => {
  // state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // keep for UI but backend returns filtered queue by endpoint

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // modal
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // debounce search
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Build params for API
  const buildParams = useCallback((p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("limit", String(PAGE_LIMIT));

    // pass filters for server if you want server-side filtering
    if (searchTerm) params.set("search", searchTerm);
    if (filterDate) params.set("date", filterDate);
    if (filterStatus && filterStatus !== "all") params.set("status", filterStatus);

    return params.toString();
  }, [searchTerm, filterDate, filterStatus]);

  // fetch function (calls new queue endpoint)
  const fetchQueue = useCallback(
    async (p = 1, reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        // New backend route: /prescriptions/prescribed-queue
        const params = buildParams(p);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/prescribed-queue?${params}`);
        if (!res.ok) throw new Error("Failed to fetch queue");
        const json = await res.json();

        // API returns shape { data: [], page, limit, total, has_more }
        const items: Prescription[] = json.data || [];
        if (reset) {
          setPrescriptions(items);
        } else {
          setPrescriptions(prev => {
            // dedupe by id
            const map = new Map(prev.map(item => [String(item.id), item]));
            for (const it of items) map.set(String(it.id), it);
            return Array.from(map.values());
          });
        }
        setHasMore(Boolean(json.has_more));
      } catch (err) {
        console.error(err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [buildParams]
  );

  // initial & filter effects
  useEffect(() => {
    setPage(1);
    // debounce search to avoid many requests
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchQueue(1, true);
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm, filterDate, filterStatus, fetchQueue]);

  // load next page when page state changes
  useEffect(() => {
    if (page === 1) return;
    fetchQueue(page, false);
  }, [page, fetchQueue]);

  // intersection observer for infinite load
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    
    const callback: IntersectionObserverCallback = (entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        setPage(prev => prev + 1);
      }
    };
    
    observer.current = new IntersectionObserver(callback, { rootMargin: "200px" });

    const current = lastItemRef.current;
    if (current && observer.current) observer.current.observe(current);

    return () => observer.current?.disconnect();
  }, [hasMore]);

  // helpers
  const handleViewDetails = (prescriptionId: string | number) => {
    setSelectedPrescriptionId(String(prescriptionId));
    setShowModal(true);
  };

  const handleIssue = (prescriptionId: string | number) => {
    onSelectPrescription(String(prescriptionId));
    setActiveTab("issue-medicine");
  };

  // Render
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-purple-600" />
            Prescription Queue
          </h2>
          <p className="text-gray-600 mt-2">Prescriptions ready for issuance (doctor-prescribed / nurse emergency)</p>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID or prescription ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="Medication Prescribed by Doctor">Medication Prescribed by Doctor</option>
                  <option value="Medication Prescribed by Nurse (Emergency)">Medication Prescribed by Nurse (Emergency)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Prescriptions ({prescriptions.length})</h3>
          </div>

          {prescriptions.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No prescriptions available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription, idx) => {
                const isLast = idx === prescriptions.length - 1;
                return (
                  <div
                    key={String(prescription.id)}
                    ref={isLast ? (el => { lastItemRef.current = el; }) : undefined}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Left: Patient */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {prescription.student?.name || prescription.other_name || "Unknown"}
                            </h4>
                            <p className="text-sm text-gray-600">ID: {prescription.student?.id_number || "—"}</p>
                            <p className="text-xs text-gray-500">PRX: {prescription.id}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(prescription.status || "")}`}>
                            {getStatusIcon(prescription.status || "")}
                            <span className="ml-1">{prescription.status}</span>
                          </span>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-gray-500">
                            <strong className="text-gray-700">Type:</strong> {prescription.patient_type || "—"} • <strong className="text-gray-700">Visit:</strong> {prescription.visit_type || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Middle: notes & meds */}
                      <div className="lg:col-span-2">
                        <div className="space-y-4">
                          {prescription.doctor_notes && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700">Doctor's Notes</h5>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{prescription.doctor_notes}</p>
                            </div>
                          )}

                          {prescription.nurse_notes && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700">Nurse's Notes</h5>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{prescription.nurse_notes}</p>
                            </div>
                          )}

                          {(prescription.medicines?.length ?? 0) > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                <Pill className="w-4 h-4 mr-1" />
                                Prescribed Medicines ({prescription.medicines?.length ?? 0})
                              </h5>
                              <div className="space-y-1 mt-1">
                                {(prescription.medicines ?? []).map((med, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 truncate max-w-[60%]" title={med.medicine_name}>{med.medicine_name || "Unknown"}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-900 font-medium">Qty: {med.quantity_prescribed ?? 0}</span>
                                      {med.quantity_issued ? <span className="text-green-600 text-xs">(Issued: {med.quantity_issued})</span> : <span className="text-blue-600 text-xs">(Pending)</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {((prescription.lab_reports?.length ?? 0) > 0) && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 flex items-center"><Clock className="w-4 h-4 mr-1" /> Lab Reports</h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                {(prescription.lab_reports ?? []).map((r, i) => (<div key={i}>• {r.test_name} ({r.status})</div>))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: date & actions */}
                      <div className="lg:col-span-1 flex flex-col justify-between">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-1 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(prescription.created_at || "").toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(prescription.created_at || "").toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full justify-center">
                          <button onClick={() => handleViewDetails(prescription.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-xl shadow-md w-full sm:w-auto">
                            <Eye className="w-4 h-4" /> View Details
                          </button>

                          {prescription.medicines?.some(m => m.quantity_issued && m.quantity_issued > 0) ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-xl border border-green-200 w-full sm:w-auto">
                              <CheckCircle className="w-4 h-4" /> Medicine Issued
                            </div>
                          ) : (
                            <button onClick={() => handleIssue(prescription.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl shadow-md w-full sm:w-auto">
                              💊 Issue Medicine
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* loading indicator */}
              {loading && <p className="text-center text-gray-500">Loading...</p>}

              {/* no more */}
              {!hasMore && !loading && (
                <p className="text-center text-gray-500">No more prescriptions</p>
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

export default PrescriptionQueue;