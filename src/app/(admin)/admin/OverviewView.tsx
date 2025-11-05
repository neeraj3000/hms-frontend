'use client';

import { Users, FileText, TestTube, Package, AlertCircle, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { DashboardStats } from '../../../types';

interface OverviewViewProps {
  stats: DashboardStats;
}

export default function OverviewView({ stats }: OverviewViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-gray-600">Monitor hospital operations at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Patients Today"
          value={stats?.totalPatientsToday}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Prescriptions"
          value={stats.totalPrescriptions}
          icon={FileText}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Lab Tests"
          value={stats.pendingLabTests}
          icon={TestTube}
          color="orange"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Low Stock Medicines"
          value={stats.lowStockMedicines}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Active Staff"
          value={stats.activeUsers}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New prescription created', user: 'Dr. Smith', time: '5 mins ago', type: 'prescription' },
              { action: 'Lab report uploaded', user: 'Lab Tech', time: '12 mins ago', type: 'lab' },
              { action: 'Medicine stock updated', user: 'Pharmacist', time: '25 mins ago', type: 'inventory' },
              { action: 'New patient registered', user: 'Nurse Jane', time: '1 hour ago', type: 'patient' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'prescription' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'lab' ? 'bg-green-100 text-green-600' :
                  activity.type === 'inventory' ? 'bg-orange-100 text-orange-600' :
                  'bg-pink-100 text-pink-600'
                }`}>
                  {activity.type === 'prescription' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {activity.type === 'lab' && <TestTube className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {activity.type === 'inventory' && <Package className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {activity.type === 'patient' && <Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900">Add User</p>
            </button>
            <button className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900">Update Stock</p>
            </button>
            <button className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900">View Reports</p>
            </button>
            <button className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-gray-900">Check Alerts</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
