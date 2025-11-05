'use client';

import { useMemo, useState } from 'react';
import { Search, Eye, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Prescription, Student } from '../../../types';
import getStatusColor from '@/components/getStatusColor';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';

interface PatientRecordsViewProps {
  prescriptions: Prescription[];
  students: Student[];
}

export default function PatientRecordsView({ prescriptions, students }: PatientRecordsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const getStudentName = (studentId: number) => students.find(s => s.id === studentId)?.name || 'Unknown';

  const uniqueStatuses = useMemo(() => {
    const set = new Set<string>();
    prescriptions.forEach(p => { if (p.status) set.add(p.status as unknown as string); });
    return Array.from(set);
  }, [prescriptions]);

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const items = prescriptions.filter(p => {
      const studentName = getStudentName(p.student_id).toLowerCase();
      const matchesName = term === '' || studentName.includes(term);
      const matchesStatus = !statusFilter || (p.status as unknown as string) === statusFilter;
      const createdAt = p.created_at ? new Date(p.created_at as unknown as string) : null;
      const matchesFrom = !from || (createdAt && createdAt >= from);
      const matchesTo = !to || (createdAt && createdAt <= to);
      return matchesName && matchesStatus && matchesFrom && matchesTo;
    });

    // Default sort: latest first
    items.sort((a, b) => {
      const ad = a.created_at ? new Date(a.created_at as unknown as string).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at as unknown as string).getTime() : 0;
      return bd - ad;
    });
    return items;
  }, [prescriptions, searchTerm, statusFilter, fromDate, toDate]);

  // Pagination
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredAndSorted.slice(startIndex, startIndex + pageSize);

  const openDetails = (id: string | number) => {
    setSelectedPrescriptionId(String(id));
    setDetailsOpen(true);
  };

  const resetPage = () => setPage(1);

  return (
    <ResponsiveContainer>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Patient Records</h2>
        <p className="text-sm sm:text-base text-gray-600">View all patient prescriptions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                className="w-full pl-9 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); resetPage(); }}
                className="w-full pl-9 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); resetPage(); }}
                className="w-full pl-9 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Page size */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing latest first</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageItems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-medium text-gray-900">#{p.id}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{getStudentName(p.student_id)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-xs sm:text-sm text-gray-600">{p.created_at ? new Date(p.created_at as unknown as string).toLocaleDateString() : '-'}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`px-2 sm:px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                        (p.status as unknown as string) || ''
                      )}`}
                    >
                      {p.status as unknown as string}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openDetails(p.id as unknown as number)}
                      className="text-blue-600 hover:text-blue-900 p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} of {totalItems}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="text-sm text-gray-700">Page {currentPage} of {totalPages}</div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PrescriptionDetailsModal
        prescriptionId={selectedPrescriptionId}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </ResponsiveContainer>
  );
}
