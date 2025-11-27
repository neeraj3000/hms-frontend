import axios from 'axios';
import { DashboardStats, User, Student, Medicine, Prescription, MedicineAnalytics, AnomalyAlert } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`);
    return response.data;
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`);
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/users/${id}`);
  },

  // Student Records
  getStudents: async (): Promise<Student[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/students`);
    return response.data;
  },

  getStudentDetails: async (id: number): Promise<Student> => {
    const response = await axios.get(`${API_BASE_URL}/admin/students/${id}`);
    return response.data;
  },

  // Prescriptions
  getPrescriptions: async (): Promise<Prescription[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/prescriptions`);
    console.log('Fetched prescriptions:', response.data);
    return response.data;
  },

  // Medicine Inventory
  getMedicines: async (): Promise<Medicine[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/medicines`);
    return response.data;
  },

  createMedicine: async (medicineData: Partial<Medicine>): Promise<Medicine> => {
    const response = await axios.post(`${API_BASE_URL}/admin/medicines`, medicineData);
    return response.data;
  },

  updateMedicine: async (id: number, medicineData: Partial<Medicine>): Promise<Medicine> => {
    const response = await axios.put(`${API_BASE_URL}/admin/medicines/${id}`, medicineData);
    return response.data;
  },

  deleteMedicine: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/medicines/${id}`);
  },

  // Analytics
  getMedicineAnalytics: async (): Promise<MedicineAnalytics[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/analytics/medicines`);
    return response.data;
  },

  // Anomaly Detection
  getAnomalies: async (): Promise<AnomalyAlert[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/anomalies`);
    return response.data;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/system-health`);
    return response.data;
  },

  // Recent Activity
  getRecentActivity: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/recent-activity`);
    return response.data;
  }
};