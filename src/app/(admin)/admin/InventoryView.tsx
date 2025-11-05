 'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { Medicine } from '../../../types';
import MedicineFormModal from './MedicineFormModal';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';

interface InventoryViewProps {
  medicines: Medicine[];
  onAdd: (medicineData: Partial<Medicine>) => Promise<void>;
  onUpdate: (id: number, medicineData: Partial<Medicine>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function InventoryView({
  medicines,
  onAdd,
  onUpdate,
  onDelete,
}: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<
    Medicine | undefined
  >();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(
    null
  );

  const handleAddClick = () => {
    setSelectedMedicine(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setIsDeleteConfirmOpen(true);
  };

  const handleSubmit = async (medicineData: Partial<Medicine>) => {
    if (selectedMedicine) {
      await onUpdate(selectedMedicine.id, medicineData);
    } else {
      await onAdd(medicineData);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (medicineToDelete) {
      await onDelete(medicineToDelete.id);
      setIsDeleteConfirmOpen(false);
      setMedicineToDelete(null);
    }
  };

  // Handle Excel import
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to import file');

      const result = await res.json();
      alert(`✅ Imported successfully: ${result.inserted} new, ${result.updated} updated.`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to import medicines');
    }
  };

  // Handle Excel export
  const handleExportExcel = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/download`);
      if (!res.ok) throw new Error('Failed to download file');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medicines_inventory.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to export medicines');
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMedicines = medicines.filter((m) => m.quantity < 50);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (quantity < 50)
      return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  return (
    <ResponsiveContainer>
      {/* Header + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Medicine Inventory
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage hospital medicine stock and supplies
          </p>
        </div>

        {/* Import & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Import Excel */}
          <label className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
            <span className="sm:hidden">Import</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
          </label>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </button>

          {/* Add Medicine */}
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Medicine</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-orange-900 mb-1">
                Low Stock Alert
              </h3>
              <p className="text-xs sm:text-sm text-orange-700">
                {lowStockMedicines.length} medicine
                {lowStockMedicines.length !== 1 ? 's' : ''} running low on
                stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Summary */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="Total Medicines" value={medicines.length} />
        <SummaryCard
          title="In Stock"
          value={medicines.filter((m) => m.quantity >= 50).length}
          color="text-green-600"
        />
        <SummaryCard
          title="Low Stock"
          value={medicines.filter((m) => m.quantity > 0 && m.quantity < 50).length}
          color="text-orange-600"
        />
        <SummaryCard
          title="Out of Stock"
          value={medicines.filter((m) => m.quantity === 0).length}
          color="text-red-600"
        />
      </div>

      {/* Medicine Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

  {/* Mobile / Tablet: compact card list for small and medium screens (hidden on lg+) */}
  <div className="lg:hidden p-3">
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No medicines found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.quantity);
                return (
                  <div key={medicine.id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{medicine.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{medicine.brand ?? '-'}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                          <span className="text-xs text-gray-600">Qty: {medicine.quantity}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(medicine)}
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                          aria-label={`Edit ${medicine.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(medicine)}
                          className="p-2 rounded-md text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${medicine.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

  {/* Table view for large screens */}
  <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                <TableHeader label="Name" />
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Brand</th>
                <TableHeader label="Quantity" />
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cost (₹)</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Total Cost (₹)</th>
                <TableHeader label="Status" />
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.quantity);
                return (
                  <tr
                    key={medicine.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>{medicine.name}</TableCell>
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell text-xs sm:text-sm text-gray-700">{medicine.brand ?? '-'}</td>
                    <TableCell>{medicine.quantity}</TableCell>
                    <td className="px-4 sm:px-6 py-3 hidden lg:table-cell text-xs sm:text-sm text-gray-700">{medicine.cost ? `₹${medicine.cost}` : '-'}</td>
                    <td className="px-4 sm:px-6 py-3 hidden xl:table-cell text-xs sm:text-sm text-gray-700">{medicine.total_cost ? `₹${medicine.total_cost}` : '-'}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`px-3 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${stockStatus.color}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(medicine)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(medicine)}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* empty state for large screens (mobile/tablet handled above) */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12 hidden lg:block">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No medicines found</p>
          </div>
        )}
      </div>

      {/* Medicine Form Modal */}
      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        medicine={selectedMedicine}
        title={selectedMedicine ? 'Edit Medicine' : 'Add New Medicine'}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Delete Medicine
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete{' '}
              <b>{medicineToDelete?.name}</b>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
}

/* ---------- Helper Components ---------- */
function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center sm:text-left">
      <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-xl sm:text-2xl font-bold ${color || 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function TableHeader({ label }: { label: string }) {
  return (
    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
      {label}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700 text-xs sm:text-sm">
      {children}
    </td>
  );
}
