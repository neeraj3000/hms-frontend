'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import TopNavbar from '@/components/layout/TopNavbar';
import SideNav from '@/components/layout/SideNav';
import OverviewView from './OverviewView';
import UserManagementView from './UserManagementView';
import PatientRecordsView from './PatientRecordsView';
import AnalyticsView from './AnalyticsView';
import InventoryView from './InventoryView';
import AnomalyView from './AnomalyView';
import IndentsHistory from './IndentHistory';
import {
  DashboardStats,
  User,
  Student,
  Medicine,
  Prescription,
  MedicineAnalytics,
  AnomalyAlert,
} from '@/types';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Activity,
  Package,
  AlertTriangle,
  FileText,
  Settings,
} from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function AdminDashboard() {
  type View =
    | 'overview'
    | 'users'
    | 'patients'
    | 'analytics'
    | 'inventory'
    | 'anomalies'
    | 'reports'
    | 'settings'
    | 'indent';

  const [activeView, setActiveView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicineAnalytics, setMedicineAnalytics] = useState<MedicineAnalytics[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);

  // 🔹 Fetch Data by View
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (activeView) {
          case 'overview':
            setStats(await adminService.getDashboardStats());
            break;
          case 'users':
            setUsers(await adminService.getUsers());
            break;
          case 'patients': {
            const [studentsData, prescriptionsData] = await Promise.all([
              adminService.getStudents(),
              adminService.getPrescriptions(),
            ]);
            setStudents(studentsData);
            setPrescriptions(prescriptionsData);
            break;
          }
          case 'analytics':
            setMedicineAnalytics(await adminService.getMedicineAnalytics());
            break;
          case 'inventory':
            setMedicines(await adminService.getMedicines());
            break;
          case 'anomalies':
            setAnomalies(await adminService.getAnomalies());
            break;
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        const msg =
          err.response?.data?.detail ||
          err.message ||
          'An unexpected error occurred while fetching data.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeView]);

  // 🔹 CRUD Handlers
  const handleUserAdd = async (userData: Partial<User>) => {
    try {
      await adminService.createUser(userData);
      toast.success('User added successfully!');
      setUsers(await adminService.getUsers());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add user');
    }
  };

  const handleUserUpdate = async (id: number, userData: Partial<User>) => {
    try {
      await adminService.updateUser(id, userData);
      toast.success('User updated successfully!');
      setUsers(await adminService.getUsers());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleUserDelete = async (id: number) => {
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted successfully!');
      setUsers(await adminService.getUsers());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleMedicineAdd = async (medicineData: Partial<Medicine>) => {
    try {
      await adminService.createMedicine(medicineData);
      toast.success('Medicine added successfully!');
      setMedicines(await adminService.getMedicines());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add medicine');
    }
  };

  const handleMedicineUpdate = async (id: number, medicineData: Partial<Medicine>) => {
    try {
      await adminService.updateMedicine(id, medicineData);
      toast.success('Medicine updated successfully!');
      setMedicines(await adminService.getMedicines());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update medicine');
    }
  };

  const handleMedicineDelete = async (id: number) => {
    try {
      await adminService.deleteMedicine(id);
      toast.success('Medicine deleted successfully!');
      setMedicines(await adminService.getMedicines());
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete medicine');
    }
  };

  // 🔹 View Rendering Logic
  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeView) {
      case 'overview':
        return stats ? <OverviewView stats={stats} /> : null;
      case 'users':
        return (
          <UserManagementView
            users={users}
            onUpdate={handleUserUpdate}
            onDelete={handleUserDelete}
            onAdd={handleUserAdd}
          />
        );
      case 'patients':
        return <PatientRecordsView prescriptions={prescriptions} students={students} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'inventory':
        return (
          <InventoryView
            medicines={medicines}
            onUpdate={handleMedicineUpdate}
            onAdd={handleMedicineAdd}
            onDelete={handleMedicineDelete}
          />
        );
      case 'indent':
        return <IndentsHistory />;
      case 'anomalies':
        return <AnomalyView anomalies={anomalies} />;
      default:
        return stats ? <OverviewView stats={stats} /> : null;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'patients', label: 'Patient Records', icon: UserCog },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'inventory', label: 'Medicine Stock', icon: Package },
    { id: 'indent', label: 'Indents', icon: FileText },
    { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 transition-all duration-300">
      {/* Sidebar */}
      <SideNav
        items={navItems}
        active={activeView}
        onChange={(id) => setActiveView(id as View)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-gray-50 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}
      >
        <TopNavbar
          title="MediCare HMS"
          subtitle="Admin Dashboard"
          notificationCount={5}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{renderView()}</main>
      </div>
    </div>
  );
}