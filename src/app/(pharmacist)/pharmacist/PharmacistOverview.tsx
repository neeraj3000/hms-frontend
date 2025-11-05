import React, { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Pill,
  ShoppingCart
} from 'lucide-react';
import StatTile from '@/components/ui/StatTile';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface PharmacistOverviewProps {
  setActiveTab: (tab: string) => void;
}

const PharmacistOverview: React.FC<PharmacistOverviewProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    issuedToday: 0,
    lowStockItems: 0,
    totalMedicines: 0
  });
  interface Prescription {
    id: number;
    student_id: string;
    student_name: string;
    created_at: string;
    status: string;
    medicines: {
      medicine: { name: string };
      quantity_prescribed: number;
    }[];
  }

  interface MedicineAlert {
    id: number;
    name: string;
    quantity: number;
    category: string;
  }

  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<MedicineAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch pharmacist dashboard statistics
      const statsResponse = await fetch('/api/pharmacist/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch pending prescriptions
      const prescriptionsResponse = await fetch('/api/pharmacist/prescriptions/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch low stock alerts
      const lowStockResponse = await fetch('/api/pharmacist/medicines/low-stock', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok && prescriptionsResponse.ok && lowStockResponse.ok) {
        const statsData = await statsResponse.json();
        const prescriptionsData = await prescriptionsResponse.json();
        const lowStockData = await lowStockResponse.json();
        
        setStats(statsData);
        setRecentPrescriptions(prescriptionsData.prescriptions);
        setLowStockAlerts(lowStockData.medicines);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Sample data for demo
      setStats({
        pendingPrescriptions: 12,
        issuedToday: 28,
        lowStockItems: 5,
        totalMedicines: 156
      });
      setRecentPrescriptions([
        { 
          id: 1, 
          student_id: 'R200137', 
          student_name: 'Rajesh Kumar', 
          created_at: '2024-01-15T10:30:00Z', 
          status: 'Prescribed by Doctor',
          medicines: [
            { medicine: { name: 'Paracetamol 500mg' }, quantity_prescribed: 10 }
          ]
        },
        { 
          id: 2, 
          student_id: 'R200142', 
          student_name: 'Priya Sharma', 
          created_at: '2024-01-15T11:15:00Z', 
          status: 'Prescribed by Doctor',
          medicines: [
            { medicine: { name: 'Amoxicillin 250mg' }, quantity_prescribed: 15 }
          ]
        }
      ]);
      setLowStockAlerts([
        { id: 1, name: 'Paracetamol 500mg', quantity: 8, category: 'Analgesic' },
        { id: 2, name: 'Ibuprofen 400mg', quantity: 5, category: 'Anti-inflammatory' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Pending Prescriptions',
      value: stats.pendingPrescriptions.toString(),
      change: '+3 new',
      icon: FileText,
      color: 'blue',
      onClick: () => setActiveTab('prescriptions')
    },
    {
      title: 'Issued Today',
      value: stats.issuedToday.toString(),
      change: '+12%',
      icon: CheckCircle,
      color: 'green',
      onClick: () => setActiveTab('prescriptions')
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
      title: 'Total Medicines',
      value: stats.totalMedicines.toString(),
      change: '+2 new',
      icon: Package,
      color: 'purple',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Pharmacist</h2>
        <p className="text-gray-600 mt-2">Here's your pharmacy overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <StatTile
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            colorClass={stat.color}
            onClick={stat.onClick}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Prescriptions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Pending Prescriptions
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentPrescriptions.slice(0, 4).map((prescription: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{prescription.student_name?.charAt(0) || 'P'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{prescription.student_name || 'Unknown Patient'}</p>
                      <p className="text-sm text-gray-600">ID: {prescription.student_id}</p>
                      <p className="text-xs text-gray-500">
                        {prescription.medicines?.length || 0} medicine(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(prescription.created_at).toLocaleTimeString()}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {prescription.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              View All Prescriptions
            </button>
          </CardBody>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Low Stock Alerts
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {lowStockAlerts.map((medicine: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Pill className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{medicine.quantity}</p>
                    <p className="text-xs text-red-500">units left</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('inventory')}
              className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Manage Inventory
            </button>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </h3>
          </CardHeader>
          <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Process Prescriptions</span>
              </div>
              <div className="text-blue-600">→</div>
            </button>
            
            <button 
              onClick={() => setActiveTab('inventory')}
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Manage Inventory</span>
              </div>
              <div className="text-purple-600">→</div>
            </button>
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">View Analytics</span>
              </div>
              <div className="text-green-600">→</div>
            </button>
          </div>
          </CardBody>
        </Card>

      {/* Today's Summary */}
      <div className="mt-8">
        <Card>
          <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Today's Summary
          </h3>
          </CardHeader>
          <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.issuedToday}</p>
              <p className="text-sm text-green-800 mt-1">Medicines Issued</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.pendingPrescriptions}</p>
              <p className="text-sm text-blue-800 mt-1">Pending Prescriptions</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.totalMedicines}</p>
              <p className="text-sm text-purple-800 mt-1">Total Medicines in Stock</p>
            </div>
          </div>
          </CardBody>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacistOverview;