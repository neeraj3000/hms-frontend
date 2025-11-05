import React, { useState, useEffect } from 'react';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import {
  Package,
  Search,
  Filter,
  Plus,
  CreditCard as Edit,
  Trash2,
  Upload,
  Download,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';

interface Medicine {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  cost: number;
  tax: number;
  total_cost: number;
}

const MedicineInventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);

  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, 'id'>>({
    name: '',
    brand: '',
    quantity: 0,
    cost: 0,
    tax: 0,
    total_cost: 0,
  });

  // Fetch medicines
  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [medicines, searchTerm, filterBrand]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines`);
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
        const uniqueBrands = Array.from(new Set(data.map((med: Medicine) => med.brand))) as string[];
        setBrands(uniqueBrands.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    const filtered = medicines.filter((medicine) => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === 'all' || medicine.brand === filterBrand;
      return matchesSearch && matchesBrand;
    });
    filtered.sort((a, b) => a.quantity - b.quantity);
    setFilteredMedicines(filtered);
  };

  const handleAddMedicine = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicine),
      });
      if (response.ok) {
        const data = await response.json();
        setMedicines([...medicines, data]);
        setShowAddModal(false);
        setNewMedicine({ name: '', brand: '', quantity: 0, cost: 0, tax: 0, total_cost: 0 });
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  const handleEditMedicine = async () => {
    if (!selectedMedicine) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/${selectedMedicine.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedMedicine),
        }
      );
      if (response.ok) {
        const updatedMedicines = medicines.map((m) =>
          m.id === selectedMedicine.id ? selectedMedicine : m
        );
        setMedicines(updatedMedicines);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error editing medicine:', error);
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/${id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setMedicines(medicines.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const handleDownloadInventory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/download`
      );
      if (!response.ok) throw new Error('Failed to download inventory.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medicine-inventory.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download file.');
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 10) return { color: 'text-red-600 bg-red-100', label: 'Critical' };
    if (quantity <= 50) return { color: 'text-yellow-600 bg-yellow-100', label: 'Low' };
    return { color: 'text-green-600 bg-green-100', label: 'Good' };
  };

  if (loading)
    return <div className="text-center py-20 text-gray-600">Loading Medicines...</div>;

  return (
    <ResponsiveContainer className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
              <Package className="w-6 h-6 mr-3 text-purple-600" />
              <span className="truncate">Medicine Inventory</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and monitor your medicine stock.</p>
          </div>
          <div className="w-full sm:w-auto flex flex-wrap justify-end items-center gap-3">
            <button
              onClick={handleDownloadInventory}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" /> Download Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Medicine
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Medicines
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Brand
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medicines Table: mobile cards (below lg) and table for lg+ */}
        <div className="p-6">
          {filteredMedicines.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No medicines found.</div>
          ) : (
            <>
              {/* Mobile / Tablet: cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                {filteredMedicines.map((med) => {
                  const stock = getStockStatus(med.quantity);
                  return (
                    <div
                      key={med.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-base font-semibold text-gray-900">{med.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{med.brand || '—'}</div>
                          </div>
                          <div className="ml-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${stock.color}`}
                            >
                              {stock.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-700 space-y-1">
                          <div>Quantity: <span className="font-medium">{med.quantity} units</span></div>
                          <div>Cost: <span className="font-medium">₹{med.cost ?? 0}</span></div>
                          <div>Total: <span className="font-medium">₹{med.total_cost ?? 0}</span></div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMedicine(med);
                            setShowEditModal(true);
                          }}
                          className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-sm"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="flex items-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table (lg+) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Medicine</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Cost (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Total Cost (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredMedicines.map((med) => {
                      const stock = getStockStatus(med.quantity);
                      return (
                        <tr key={med.id}>
                          <td className="px-6 py-4">{med.name}</td>
                          <td className="px-6 py-4">{med.brand || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${stock.color}`}>
                              {med.quantity} units
                            </span>
                          </td>
                          <td className="px-6 py-4">{med.cost ?? 0}</td>
                          <td className="px-6 py-4">{med.total_cost ?? 0}</td>
                          <td className="px-6 py-4 flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedMedicine(med);
                                setShowEditModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(med.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Medicine</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {['name', 'brand', 'quantity', 'cost', 'tax', 'total_cost'].map((field) => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <input
                  type={['quantity', 'cost', 'tax', 'total_cost'].includes(field) ? 'number' : 'text'}
                  value={(newMedicine as any)[field] || ''}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, [field]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}

            <button
              onClick={handleAddMedicine}
              className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Medicine
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Medicine</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {['name', 'brand', 'quantity', 'cost', 'tax', 'total_cost'].map((field) => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <input
                  type={['quantity', 'cost', 'tax', 'total_cost'].includes(field) ? 'number' : 'text'}
                  value={(selectedMedicine as any)[field] || ''}
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      [field]: e.target.value,
                    } as Medicine)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}

            <button
              onClick={handleEditMedicine}
              className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default MedicineInventory;
