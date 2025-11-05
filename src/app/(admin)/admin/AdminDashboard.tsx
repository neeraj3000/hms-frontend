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
import { DashboardStats, User, Student, Medicine, Prescription, MedicineAnalytics, AnomalyAlert } from '@/types';
import { LayoutDashboard, Users, UserCog, Activity, Package, AlertTriangle, FileText, Settings } from 'lucide-react';
import { adminService } from '@/services/adminService';
import {
  fallbackStats,
  fallbackUsers,
  fallbackStudents,
  fallbackMedicines,
  fallbackPrescriptions,
  fallbackMedicineAnalytics,
  fallbackAnomalies
} from './fallbackData';
import IndentsHistory from './IndentHistory';

export default function AdminDashboard() {
  type View = 'overview' | 'users' | 'patients' | 'analytics' | 'inventory' | 'anomalies' | 'reports' | 'settings' | 'indent';

  const [activeView, setActiveView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Map each view to its loading state
  const [loadingStates, setLoadingStates] = useState<Record<View, boolean>>({
    overview: false,
    users: false,
    patients: false,
    analytics: false,
    inventory: false,
    anomalies: false,
    reports: false,
    settings: false,
    indent: false
  });

  // Map each view to its error
  const [errors, setErrors] = useState<Record<View, string | null>>({
    overview: null,
    users: null,
    patients: null,
    analytics: null,
    inventory: null,
    anomalies: null,
    reports: null,
    settings: null,
    indent: null
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicineAnalytics, setMedicineAnalytics] = useState<MedicineAnalytics[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [notifications, setNotifications] = useState<{ message: string; type: 'success' | 'error' | 'warning' }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStates(prev => ({ ...prev, [activeView]: true }));
      setErrors(prev => ({ ...prev, [activeView]: null }));

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
              adminService.getPrescriptions()
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
      } catch (err) {
        console.error('API Error:', err);
        let statusCode: number | null = null;
        let errorMessage = 'An unexpected error occurred';

        if (err instanceof Error) {
          errorMessage = err.message;
          const anyErr = err as any;
          if (anyErr.response?.status) statusCode = anyErr.response.status;
        }

        // Friendly message
        let friendlyMessage = errorMessage;
        if (statusCode === 404) friendlyMessage = 'Requested data not found (404). Showing fallback data.';
        else if (statusCode === 401 || statusCode === 403)
          friendlyMessage = 'You do not have permission to view this data.';
        else if (statusCode) friendlyMessage = `Request failed with status ${statusCode}.`;

        // Save error for this view
        setErrors(prev => ({ ...prev, [activeView]: friendlyMessage }));

        // Load fallback data gracefully
        switch (activeView) {
          case 'overview':
            setStats(fallbackStats);
            break;
          case 'users':
            setUsers(fallbackUsers);
            break;
          case 'patients':
            setStudents(fallbackStudents);
            setPrescriptions(fallbackPrescriptions);
            break;
          case 'analytics':
            setMedicineAnalytics(fallbackMedicineAnalytics);
            break;
          case 'inventory':
            setMedicines(fallbackMedicines);
            break;
          case 'anomalies':
            setAnomalies(fallbackAnomalies);
            break;
        }

        // Add notification
        setNotifications(prev => [
          ...prev,
          { message: `Failed to load ${activeView} data: ${friendlyMessage}`, type: 'error' }
        ]);
      } finally {
        setLoadingStates(prev => ({ ...prev, [activeView]: false }));
      }
    };

    fetchData();
  }, [activeView]);

  // View rendering logic
  const renderView = () => {
    // ✅ Helper to detect if fallback data exists (to still show UI)
    const hasFallbackData = (view: View) => {
      switch (view) {
        case 'overview':
          return !!stats;
        case 'users':
          return users.length > 0;
        case 'patients':
          return students.length > 0 || prescriptions.length > 0;
        case 'analytics':
          return medicineAnalytics.length > 0;
        case 'inventory':
          return medicines.length > 0;
        case 'anomalies':
          return anomalies.length > 0;
        default:
          return false;
      }
    };

    if (loadingStates[activeView]) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // ✅ Display fallback data even when an error occurs
    // (don't block rendering with an error screen unless there is *no* fallback data)
    if (errors[activeView] && !hasFallbackData(activeView)) {
      return (
        <div className="flex items-center justify-center h-full text-center text-red-500">
          <div>
            <p className="text-xl font-semibold mb-2">Error Loading Data</p>
            <p>{errors[activeView]}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
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

// 🔹 Add User
const handleUserAdd = async (userData: Partial<User>) => {
  try {
    await adminService.createUser(userData);
    toast.success('User added successfully!');
    console.log('✅ User added successfully');
    await adminService.getUsers?.(); // refresh UI if function exists
  } catch (error: any) {
    console.error('Error adding user:', error);
    toast.error(error.response?.data?.detail || 'Failed to add user');
  }
};

// 🔹 Update User
const handleUserUpdate = async (id: number, userData: Partial<User>) => {
  try {
    await adminService.updateUser(id, userData);
    toast.success('User updated successfully!');
    console.log('✅ User updated successfully');
    await adminService.getUsers?.();
  } catch (error: any) {
    console.error('Error updating user:', error);
    toast.error(error.response?.data?.detail || 'Failed to update user');
  }
};

// 🔹 Delete User
const handleUserDelete = async (id: number) => {
  try {
    await adminService.deleteUser(id);
    toast.success('User deleted successfully!');
    console.log('✅ User deleted successfully');
    await adminService.getUsers?.();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error(error.response?.data?.detail || 'Failed to delete user');
  }
};

// 🔹 Add Medicine
const handleMedicineAdd = async (medicineData: Partial<Medicine>) => {
  try {
    await adminService.createMedicine(medicineData);
    toast.success('Medicine added successfully!');
    console.log('✅ Medicine added successfully');
    await adminService.getMedicines?.();
  } catch (error: any) {
    console.error('Error adding medicine:', error);
    toast.error(error.response?.data?.detail || 'Failed to add medicine');
  }
};

// 🔹 Update Medicine
const handleMedicineUpdate = async (id: number, medicineData: Partial<Medicine>) => {
  try {
    await adminService.updateMedicine(id, medicineData);
    toast.success('Medicine updated successfully!');
    console.log('✅ Medicine updated successfully');
    await adminService.getMedicines?.();
  } catch (error: any) {
    console.error('Error updating medicine:', error);
    toast.error(error.response?.data?.detail || 'Failed to update medicine');
  }
};

// 🔹 Delete Medicine
const handleMedicineDelete = async (id: number) => {
  try {
    await adminService.deleteMedicine(id);
    toast.success('Medicine deleted successfully!');
    console.log('✅ Medicine deleted successfully');
    await adminService.getMedicines?.();
  } catch (error: any) {
    console.error('Error deleting medicine:', error);
    toast.error(error.response?.data?.detail || 'Failed to delete medicine');
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
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav items={navItems} active={activeView} onChange={(id) => setActiveView(id as View)} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar title="Hospital Management System" subtitle="Admin Dashboard" notificationCount={5} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{renderView()}</main>
      </div>
    </div>
  );
}
