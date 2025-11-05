'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, Activity, Calendar, Pill, PackageCheck, AlertTriangle, Boxes } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { DashboardStats, MedicineAnalytics } from '../../../types';
import StatCard from './StatCard';
import { toast } from 'react-hot-toast';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';

export default function AnalyticsView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [medicineAnalytics, setMedicineAnalytics] = useState<MedicineAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashboardStats, analytics] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getMedicineAnalytics()
        ]);

        setStats(dashboardStats);
        setMedicineAnalytics(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center text-gray-600 mt-8">No analytics data available.</p>;
  }

  const topMedicines = [...medicineAnalytics].sort((a, b) => b.prescriptionCount - a.prescriptionCount).slice(0, 10);

  return (
    <ResponsiveContainer className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-sm text-gray-600">Real-time data-driven insights for hospital operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Total Patients Today</p>
          <p className="text-3xl font-bold">{stats.totalPatientsToday}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <FileText className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Prescriptions</p>
          <p className="text-3xl font-bold">{stats.totalPrescriptions}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <Activity className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Pending Lab Tests</p>
          <p className="text-3xl font-bold">{stats.pendingLabTests}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Active Users</p>
          <p className="text-3xl font-bold">{stats.activeUsers}</p>
        </div>
      </div>

      {/* Medicine Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Medicines"
          value={medicineAnalytics.length.toString()}
          icon={Pill}
          color="blue"
          trend={{ value: 8.2, isPositive: true }}
        />

        <StatCard
          title="Low Stock Medicines"
          value={stats.lowStockMedicines.toString()}
          icon={AlertTriangle}
          color="orange"
          trend={{ value: 4.5, isPositive: false }}
        />

        <StatCard
          title="Expiring Soon"
          value={medicineAnalytics.filter(m => m.stockLevel < 20).length.toString()}
          icon={PackageCheck}
          color="green"
          trend={{ value: 5.1, isPositive: false }}
        />

        <StatCard
          title="Medicine Stock Value"
          value={`₹${stats.totalStockValue.toLocaleString('en-IN')}`}
          icon={Boxes}
          color="purple"
        />
      </div>

      {/* Top Medicines */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-lg font-semibold text-gray-900">Most Prescribed Medicines</h3>
    <TrendingUp className="w-5 h-5 text-gray-400" />
  </div>

  {topMedicines.length === 0 ? (
    <p className="text-gray-500 text-sm">No medicine analytics data available.</p>
  ) : (
    <div className="space-y-4">
      {topMedicines.map((medicine, index) => {
        const maxCount = Math.max(...topMedicines.map(m => m.prescriptionCount));
        const percentage = (medicine.prescriptionCount / maxCount) * 100;

        return (
          <div
            key={index}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {/* Medicine Name + Counts */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 truncate pr-2">
                {medicine.name}
              </span>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-blue-500" /> {medicine.prescriptionCount}
                </span>
                <span className="flex items-center gap-1">
                  <Boxes className="w-3 h-3 text-green-500" /> Stock: {medicine.stockLevel}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

    </ResponsiveContainer>
  );
}
