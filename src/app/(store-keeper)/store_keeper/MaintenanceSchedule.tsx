import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Save,
  X,
  Eye
} from 'lucide-react';

const MaintenanceSchedule: React.FC = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newMaintenance, setNewMaintenance] = useState<any>({
    item_id: '',
    item_name: '',
    maintenance_type: 'Routine',
    scheduled_date: '',
    priority: 'Medium',
    notes: ''
  });

  useEffect(() => {
    fetchMaintenanceSchedule();
  }, []);

  useEffect(() => {
    filterItems();
  }, [maintenanceItems, searchTerm, filterStatus, filterPriority]);

  const fetchMaintenanceSchedule = async () => {
    try {
      const response = await fetch('/api/store-keeper/maintenance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceItems(data.maintenance_items);
      }
    } catch (error) {
      console.error('Error fetching maintenance schedule:', error);
      // Sample data for demo
      const sampleMaintenanceItems = [
        {
          id: 1,
          item_id: 1,
          item_name: 'X-Ray Machine',
          maintenance_type: 'Routine',
          scheduled_date: '2024-01-20',
          last_maintenance: '2023-10-20',
          status: 'Scheduled',
          priority: 'High',
          technician: 'John Smith',
          notes: 'Annual calibration and safety check required',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          item_id: 3,
          item_name: 'Ventilator Unit 3',
          maintenance_type: 'Repair',
          scheduled_date: '2024-01-18',
          last_maintenance: '2023-11-15',
          status: 'In Progress',
          priority: 'Critical',
          technician: 'Sarah Johnson',
          notes: 'Pressure sensor malfunction reported',
          created_at: '2024-01-14T14:20:00Z'
        },
        {
          id: 3,
          item_id: 2,
          item_name: 'ECG Machine',
          maintenance_type: 'Routine',
          scheduled_date: '2024-01-25',
          last_maintenance: '2023-12-25',
          status: 'Completed',
          priority: 'Medium',
          technician: 'Mike Wilson',
          notes: 'Monthly maintenance completed successfully',
          created_at: '2024-01-13T09:15:00Z'
        },
        {
          id: 4,
          item_id: 4,
          item_name: 'Operating Table 2',
          maintenance_type: 'Inspection',
          scheduled_date: '2024-01-22',
          last_maintenance: '2023-09-22',
          status: 'Overdue',
          priority: 'High',
          technician: 'David Brown',
          notes: 'Quarterly safety inspection due',
          created_at: '2024-01-12T16:45:00Z'
        }
      ];
      setMaintenanceItems(sampleMaintenanceItems);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = maintenanceItems.filter((item: any) => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.technician.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesPriority = filterPriority === 'all' || item.priority.toLowerCase() === filterPriority.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort by priority and date
    filtered.sort((a: any, b: any) => {
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
    });

    setFilteredItems(filtered);
  };

  const handleAddMaintenance = async () => {
    try {
      const response = await fetch('/api/store-keeper/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaintenance),
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceItems([...maintenanceItems, data.maintenance_item]);
        setNewMaintenance({
          item_id: '',
          item_name: '',
          maintenance_type: 'Routine',
          scheduled_date: '',
          priority: 'Medium',
          notes: ''
        });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding maintenance:', error);
      // For demo, add to local state
      const newId = Math.max(...maintenanceItems.map((item: any) => item.id)) + 1;
      setMaintenanceItems([...maintenanceItems, { 
        ...newMaintenance, 
        id: newId,
        status: 'Scheduled',
        technician: 'TBD',
        created_at: new Date().toISOString() 
      }]);
      setNewMaintenance({
        item_id: '',
        item_name: '',
        maintenance_type: 'Routine',
        scheduled_date: '',
        priority: 'Medium',
        notes: ''
      });
      setShowAddModal(false);
    }
  };

  const updateMaintenanceStatus = async (itemId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/store-keeper/maintenance/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedItems = maintenanceItems.map((item: any) => 
          item.id === itemId ? { ...item, status: newStatus } : item
        );
        setMaintenanceItems(updatedItems);
      }
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      // For demo, update local state
      const updatedItems = maintenanceItems.map((item: any) => 
        item.id === itemId ? { ...item, status: newStatus } : item
      );
      setMaintenanceItems(updatedItems);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in progress':
        return <Wrench className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-32">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Wrench className="w-6 h-6 mr-3 text-orange-600" />
                Maintenance Schedule
              </h2>
              <p className="text-gray-600 mt-2">Track and manage equipment maintenance</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Maintenance</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Maintenance
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by item or technician..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Priority
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="priority"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Items List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Maintenance Items ({filteredItems.length})
            </h3>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No maintenance items found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item: any, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Item Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                          <p className="text-sm text-gray-600">{item.maintenance_type}</p>
                          <p className="text-xs text-gray-500">ID: {item.item_id}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Details */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Scheduled Date</h5>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-900">{new Date(item.scheduled_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Last Maintenance</h5>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-900">
                                {item.last_maintenance ? new Date(item.last_maintenance).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Technician</h5>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900">{item.technician}</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Notes</h5>
                          <p className="text-sm text-gray-600">{item.notes}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailsModal(true);
                          }}
                          className="w-full flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        
                        {item.status !== 'Completed' && (
                          <div className="space-y-1">
                            {item.status === 'Scheduled' && (
                              <button
                                onClick={() => updateMaintenanceStatus(item.id, 'In Progress')}
                                className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors duration-200"
                              >
                                Start Work
                              </button>
                            )}
                            {item.status === 'In Progress' && (
                              <button
                                onClick={() => updateMaintenanceStatus(item.id, 'Completed')}
                                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Maintenance</h3>
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
                  value={newMaintenance.item_name}
                  onChange={(e) => setNewMaintenance({...newMaintenance, item_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., X-Ray Machine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select
                  value={newMaintenance.maintenance_type}
                  onChange={(e) => setNewMaintenance({...newMaintenance, maintenance_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Routine">Routine</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Calibration">Calibration</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={newMaintenance.scheduled_date}
                  onChange={(e) => setNewMaintenance({...newMaintenance, scheduled_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newMaintenance.priority}
                  onChange={(e) => setNewMaintenance({...newMaintenance, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newMaintenance.notes}
                  onChange={(e) => setNewMaintenance({...newMaintenance, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Additional notes or requirements..."
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
                onClick={handleAddMaintenance}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <p className="text-gray-900 font-medium">{selectedItem.item_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maintenance Type</label>
                  <p className="text-gray-900">{selectedItem.maintenance_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedItem.priority)}`}>
                    {selectedItem.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedItem.status)}`}>
                    {getStatusIcon(selectedItem.status)}
                    <span className="ml-1">{selectedItem.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                  <p className="text-gray-900">{new Date(selectedItem.scheduled_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Maintenance</label>
                  <p className="text-gray-900">
                    {selectedItem.last_maintenance ? new Date(selectedItem.last_maintenance).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Technician</label>
                  <p className="text-gray-900">{selectedItem.technician}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedItem.notes}</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSchedule;