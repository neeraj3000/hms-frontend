import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  AlertTriangle, 
  Calendar, 
  Save, 
  X,
  Wrench
} from 'lucide-react';

interface InventoryManagementProps {
  onSelectItem: (itemId: string) => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ onSelectItem }) => {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Movable',
    quantity: 0
  });

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [inventoryItems, searchTerm, filterCategory]);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inventory`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      // Sample data for demo
      const sampleItems = [
        { id: 1, name: 'ECG Machine', category: 'Movable', quantity: 5, created_at: '2024-01-15T10:30:00Z' },
        { id: 2, name: 'Hospital Beds', category: 'Non-Movable', quantity: 50, created_at: '2024-01-14T14:20:00Z' },
        { id: 3, name: 'Wheelchairs', category: 'Movable', quantity: 15, created_at: '2024-01-13T09:15:00Z' },
        { id: 4, name: 'X-Ray Machine', category: 'Movable', quantity: 2, created_at: '2024-01-12T16:45:00Z' },
        { id: 5, name: 'Operating Tables', category: 'Non-Movable', quantity: 8, created_at: '2024-01-11T11:30:00Z' },
        { id: 6, name: 'Ventilators', category: 'Movable', quantity: 3, created_at: '2024-01-10T13:20:00Z' }
      ];
      setInventoryItems(sampleItems);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (!inventoryItems || !Array.isArray(inventoryItems)) {
      setFilteredItems([]);
      return;
    }

    const filtered = inventoryItems
      .filter((item: any) => {
        const name = item?.name?.toLowerCase() || "";
        const category = item?.category || "";

        const matchesSearch = name.includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || category === filterCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => (a?.quantity ?? 0) - (b?.quantity ?? 0)); // Sort by quantity safely

    setFilteredItems(filtered);
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inventory`, {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const data = await response.json();
        setInventoryItems([...inventoryItems, data.item]);
        setNewItem({ name: '', category: 'Movable', quantity: 0 });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      // For demo, add to local state
      const newId = Math.max(...inventoryItems.map((item: any) => item.id)) + 1;
      setInventoryItems([...inventoryItems, { 
        ...newItem, 
        id: newId, 
        created_at: new Date().toISOString() 
      }]);
      setNewItem({ name: '', category: 'Movable', quantity: 0 });
      setShowAddModal(false);
    }
  };

  const handleEditItem = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inventory/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedItem),
      });

      if (response.ok) {
        const updatedItems = inventoryItems.map((item: any) => 
          item.id === selectedItem.id ? selectedItem : item
        );
        setInventoryItems(updatedItems);
        setShowEditModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // For demo, update local state
      const updatedItems = inventoryItems.map((item: any) => 
        item.id === selectedItem.id ? selectedItem : item
      );
      setInventoryItems(updatedItems);
      setShowEditModal(false);
      setSelectedItem(null);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        setInventoryItems(inventoryItems.filter((item: any) => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // For demo, remove from local state
      setInventoryItems(inventoryItems.filter((item: any) => item.id !== itemId));
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inventory/bulk-upload`, {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully uploaded ${data.count} items`);
        fetchInventoryItems(); // Refresh the list
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Bulk upload functionality will be implemented with backend integration');
    }
  };

  const handleDownloadInventory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inventory/download`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory-items.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading inventory:', error);
      alert('Download functionality will be implemented with backend integration');
    }
  };

  const getStockStatus = (quantity: number, category: string) => {
    const threshold = category === 'Movable' ? 5 : 10;
    if (quantity <= threshold) return { color: 'text-red-600 bg-red-100', label: 'Low Stock' };
    return { color: 'text-green-600 bg-green-100', label: 'Good Stock' };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-24">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="w-full max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-full">
        <div className="p-2 sm:p-6 border-b border-gray-200 w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center w-full">
            <div className="w-full min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-3 text-orange-600" />
                Inventory Management
              </h2>
              <p className="text-gray-600 mt-2">Manage hospital equipment and infrastructure</p>
            </div>
            <div className="w-full flex flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3 sm:justify-end min-w-0">
              <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors duration-200">
                <Upload className="w-4 h-4" />
                <span>Upload Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleBulkUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleDownloadInventory}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="p-2 sm:p-6 bg-gray-50 border-b border-gray-200 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 w-full">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Items
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by item name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Movable">Movable</option>
                  <option value="Non-Movable">Non-Movable</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
  <div className="p-2 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Items ({filteredItems.length})
            </h3>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No items found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item: any) => {
                    const stockStatus = getStockStatus(item.quantity, item.category);
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.category === 'Movable' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              {item.quantity} units
                            </span>
                            {item.quantity <= (item.category === 'Movable' ? 5 : 10) && (
                              <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowEditModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSelectItem(item.id.toString())}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., ECG Machine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Movable">Movable</option>
                  <option value="Non-Movable">Non-Movable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Item</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Movable">Movable</option>
                  <option value="Non-Movable">Non-Movable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={selectedItem.quantity}
                  onChange={(e) => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;