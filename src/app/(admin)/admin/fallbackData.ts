import { DashboardStats, User, Student, Medicine, Prescription, MedicineAnalytics, AnomalyAlert, UserRole } from '@/types';

export const fallbackStats: DashboardStats = {
  totalPatientsToday: 45,
  totalPrescriptions: 150,
  pendingLabTests: 12,
  lowStockMedicines: 8,
  activeUsers: 25,
  totalStudents: 1200,
  // derived fallback total stock value (sum of sample medicines' total_cost)
  totalStockValue: 5140
};

export const fallbackUsers: User[] = [
  {
    id: 1,
    username: 'admin_user',
    email: 'admin@example.com',
    password: "**",
    role: UserRole.ADMIN
  },
  {
    id: 2,
    username: 'dr_smith',
    email: 'smith@example.com',
    password: "**",
    role: UserRole.DOCTOR
  },
  {
    id: 3,
    username: 'nurse_jane',
    email: 'jane@example.com',
    password: "**",
    role: UserRole.NURSE
  }
];

export const fallbackStudents: Student[] = [
  {
    id: 1,
    id_number: 'STU001',
    email: 'student1@example.com',
    name: 'John Doe',
    branch: 'Computer Science',
    section: 'A'
  },
  {
    id: 2,
    id_number: 'STU002',
    email: 'student2@example.com',
    name: 'Jane Smith',
    branch: 'Electronics',
    section: 'B'
  }
];

export const fallbackMedicines: Medicine[] = [
  {
    id: 1,
    name: 'Paracetamol',
    category: 'Pain Relief',
    quantity: 500,
    expiry_date: '2024-12-31',
    brand: 'Acme Pharma',
    cost: 5,
    total_cost: 2500
  },
  {
    id: 2,
    name: 'Amoxicillin',
    category: 'Antibiotics',
    quantity: 200,
    expiry_date: '2024-10-15',
    brand: 'HealthCorp',
    cost: 12,
    total_cost: 2400
  },
  {
    id: 3,
    name: 'Ibuprofen',
    category: 'Pain Relief',
    quantity: 30,
    expiry_date: '2024-08-20',
    brand: 'MediLife',
    cost: 8,
    total_cost: 240
  }
];

export const fallbackPrescriptions: Prescription[] = [
  {
    id: 1,
    student_id: 1,
    nurse_id: 3,
    doctor_id: 2,
    status: 'completed',
    created_at: new Date().toISOString(),
    nurse_notes: 'Regular checkup',
    weight: '65',
    bp: '120/80',
    temperature: '37.2',
    age: 20
  },
  {
    id: 2,
    student_id: 2,
    nurse_id: 3,
    doctor_id: 0,
    status: 'pending',
    created_at: new Date().toISOString(),
    nurse_notes: 'Fever and headache',
    weight: '58',
    bp: '110/70',
    temperature: '38.5',
    age: 19
  }
];

export const fallbackMedicineAnalytics: MedicineAnalytics[] = [
  {
    name: 'Paracetamol',
    prescriptionCount: 150,
    stockLevel: 500
  },
  {
    name: 'Amoxicillin',
    prescriptionCount: 75,
    stockLevel: 200
  },
  {
    name: 'Ibuprofen',
    prescriptionCount: 100,
    stockLevel: 30
  }
];

export const fallbackAnomalies: AnomalyAlert[] = [
  {
    id: '1',
    type: 'stock_level',
    severity: 'high',
    message: 'Ibuprofen stock critically low',
    timestamp: new Date().toISOString(),
    details: 'Current stock: 30 units. Reorder point: 50 units.'
  },
  {
    id: '2',
    type: 'prescription_pattern',
    severity: 'medium',
    message: 'Unusual increase in antibiotic prescriptions',
    timestamp: new Date().toISOString(),
    details: '50% increase in antibiotic prescriptions over the last week.'
  }
];