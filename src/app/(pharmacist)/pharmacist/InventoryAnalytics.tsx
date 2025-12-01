import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Package,
  Calendar,
  Pill,
  Activity,
  Users
} from 'lucide-react';

interface MedicinePrescribed {
  name: string;
  count: number;
  category: string;
}

interface StockLevel {
  category: string;
  total: number;
  low: number;
}

interface MonthlyUsage {
  month: string;
  issued: number;
  received: number;
}

interface AnalyticsData {
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  totalValue: number;
  mostPrescribed: MedicinePrescribed[];
  stockLevels: StockLevel[];
  monthlyUsage: MonthlyUsage[];
}

const InventoryAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMedicines: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalValue: 0,
    mostPrescribed: [],
    stockLevels: [],
    monthlyUsage: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/medicines?days=${timeRange}`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Sample data for demo
      setAnalytics({
        totalMedicines: 156,
        lowStockCount: 8,
        expiringCount: 3,
        totalValue: 45000,
        mostPrescribed: [
          { name: 'Paracetamol 500mg', count: 45, category: 'Analgesic' },
          { name: 'Amoxicillin 250mg', count: 32, category: 'Antibiotic' },
          { name: 'Cetirizine 10mg', count: 28, category: 'Antihistamine' },
          { name: 'Ibuprofen 400mg', count: 24, category: 'Anti-inflammatory' },
          { name: 'Omeprazole 20mg', count: 19, category: 'Antacid' }
        ],
        stockLevels: [
          { category: 'Analgesic', total: 450, low: 2 },
          { category: 'Antibiotic', total: 280, low: 1 },
          { category: 'Antihistamine', total: 320, low: 0 },
          { category: 'Anti-inflammatory', total: 180, low: 3 },
          { category: 'Antacid', total: 150, low: 2 }
        ],
        monthlyUsage: [
          { month: 'Jan', issued: 120, received: 200 },
          { month: 'Feb', issued: 135, received: 150 },
          { month: 'Mar', issued: 148, received: 180 },
          { month: 'Apr', issued: 162, received: 220 },
          { month: 'May', issued: 178, received: 160 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Medicines',
      value: analytics.totalMedicines.toString(),
      icon: Package,
      color: 'blue',
      change: '+5 this month'
    },
    {
      title: 'Low Stock Items',
      value: analytics.lowStockCount.toString(),
      icon: AlertTriangle,
      color: 'red',
      change: 'Need attention'
    },
    {
      title: 'Expiring Soon',
      value: analytics.expiringCount.toString(),
      icon: Calendar,
      color: 'yellow',
      change: 'Within 3 months'
    },
    {
      title: 'Inventory Value',
      value: `₹${analytics.totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
      change: '+8% from last month'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Inventory Analytics</h2>
            <p className="text-gray-600 mt-2">Track your pharmacy performance and inventory insights</p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.includes('+') ? 'text-green-600' : 
                    stat.change.includes('Need') ? 'text-red-600' : 'text-yellow-600'
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

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Most Prescribed Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-purple-600" />
              Most Prescribed Medicines
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.mostPrescribed.map((medicine: any, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{medicine.count}</p>
                    <p className="text-sm text-gray-600">medicines</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Levels by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Stock Levels by Category
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.stockLevels.map((category: any, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.total} units</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        category.low > 0 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((category.total / 500) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {category.low > 0 && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{category.low} items low stock</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Usage Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Monthly Usage Trends
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analytics.monthlyUsage.map((month: any, index) => (
              <div key={index} className="text-center">
                <div className="space-y-2 mb-3">
                  <div className="h-24 flex items-end justify-center space-x-1">
                    <div 
                      className="w-4 bg-green-500 rounded-t"
                      style={{ height: `${(month.received / 250) * 100}%` }}
                      title={`Received: ${month.received}`}
                    ></div>
                    <div 
                      className="w-4 bg-red-500 rounded-t"
                      style={{ height: `${(month.issued / 250) * 100}%` }}
                      title={`Issued: ${month.issued}`}
                    ></div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">{month.month}</p>
                <div className="text-xs text-gray-600 mt-1">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded"></div>
                      <span>{month.received}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded"></div>
                      <span>{month.issued}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Medicines Received</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Medicines Issued</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">High Demand Categories</p>
                  <p className="text-sm text-gray-600">Analgesics and Antibiotics are most prescribed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Stock Optimization</p>
                  <p className="text-sm text-gray-600">Consider increasing stock for high-demand medicines</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Urgent Action Required</p>
                  <p className="text-sm text-gray-600">{analytics.lowStockCount} medicines need immediate restocking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Inventory Management</p>
                <p className="text-sm text-blue-700">Set up automatic reorder points for frequently used medicines</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Cost Optimization</p>
                <p className="text-sm text-green-700">Consider bulk purchasing for high-volume medicines</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Quality Control</p>
                <p className="text-sm text-purple-700">Monitor expiry dates and implement FIFO system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;