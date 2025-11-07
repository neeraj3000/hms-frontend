import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Wrench, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react';

interface StoreKeeperOverviewProps {
  setActiveTab: (tab: string) => void;
}

interface Stats {
  totalItems: number;
  lowStockItems: number;
  maintenanceDue: number;
  totalValue: number;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  created_at: string;
}

interface MaintenanceAlert {
  id: number;
  name: string;
  category: string;
  lastMaintenance?: string;
  nextDue?: string;
}

const StoreKeeperOverview: React.FC<StoreKeeperOverviewProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    lowStockItems: 0,
    maintenanceDue: 0,
    totalValue: 0
  });
  const [recentItems, setRecentItems] = useState<InventoryItem[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch store keeper dashboard statistics
      const statsResponse = await fetch('/api/store-keeper/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch recent inventory items
      const itemsResponse = await fetch('/api/store-keeper/inventory/recent', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch maintenance alerts
      const maintenanceResponse = await fetch('/api/store-keeper/maintenance/alerts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok && itemsResponse.ok && maintenanceResponse.ok) {
        const statsData = await statsResponse.json();
        const itemsData = await itemsResponse.json();
        const maintenanceData = await maintenanceResponse.json();
        
        setStats(statsData);
        setRecentItems(itemsData.items);
        setMaintenanceAlerts(maintenanceData.alerts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Sample data for demo
      setStats({
        totalItems: 245,
        lowStockItems: 12,
        maintenanceDue: 8,
        totalValue: 2500000
      });
      setRecentItems([
        { 
          id: 1, 
          name: 'ECG Machine',
          category: 'Movable',
          quantity: 5,
          created_at: '2024-01-15T10:30:00Z'
        },
        { 
          id: 2, 
          name: 'Hospital Beds',
          category: 'Non-Movable',
          quantity: 50,
          created_at: '2024-01-14T14:20:00Z'
        }
      ]);
      setMaintenanceAlerts([
        { id: 1, name: 'X-Ray Machine', category: 'Movable', lastMaintenance: '2023-10-15', nextDue: '2024-01-15' },
        { id: 2, name: 'Ventilator Unit 3', category: 'Movable', lastMaintenance: '2023-11-20', nextDue: '2024-01-20' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Total Items',
      value: stats.totalItems.toString(),
      change: '+15 this month',
      icon: Package,
      color: 'blue',
      onClick: () => setActiveTab('inventory')
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      change: 'Need attention',
      icon: AlertTriangle,
      color: 'red',
      onClick: () => setActiveTab('inventory')
    },
    {
      title: 'Maintenance Due',
      value: stats.maintenanceDue.toString(),
      change: 'This week',
      icon: Wrench,
      color: 'yellow',
      onClick: () => setActiveTab('maintenance')
    },
    {
      title: 'Total Value',
      value: `₹${(stats.totalValue / 100000).toFixed(1)}L`,
      change: '+8% from last month',
      icon: TrendingUp,
      color: 'green',
      onClick: () => setActiveTab('inventory')
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Store Keeper</h2>
        <p className="text-gray-600 mt-2">Here's your inventory and maintenance overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              onClick={stat.onClick}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.includes('+') ? 'text-green-600' : 
                    stat.change.includes('Need') || stat.change.includes('This week') ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inventory Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-600" />
              Recent Inventory Items
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentItems.map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Category: {item.category}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(item.created_at).toLocaleDateString()}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.category === 'Movable' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('inventory')}
              className="w-full mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
            >
              View All Items
            </button>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-red-600" />
              Maintenance Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {maintenanceAlerts.map((alert: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.name}</p>
                      <p className="text-sm text-gray-600">{alert.category}</p>
                      <p className="text-xs text-red-600">Due: {alert.nextDue}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Overdue
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('maintenance')}
              className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              View Maintenance Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('inventory')}
              className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Manage Inventory</span>
              </div>
              <div className="text-orange-600">→</div>
            </button>
            
            <button 
              onClick={() => setActiveTab('maintenance')}
              className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Wrench className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Schedule Maintenance</span>
              </div>
              <div className="text-yellow-600">→</div>
            </button>
            
            <button className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Generate Reports</span>
              </div>
              <div className="text-green-600">→</div>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Today's Summary
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.totalItems}</p>
              <p className="text-sm text-orange-800 mt-1">Total Items</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
              <p className="text-sm text-red-800 mt-1">Low Stock</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenanceDue}</p>
              <p className="text-sm text-yellow-800 mt-1">Maintenance Due</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
              <p className="text-sm text-green-800 mt-1">Total Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreKeeperOverview;