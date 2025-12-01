import { ReactNode } from "react";

export interface User {
	id: number;
	username: string;
	email: string;
    password: string,
	role: UserRole;
}

export enum UserRole {
	ADMIN = "admin",
	DOCTOR = "doctor",
	NURSE = "nurse",
	PHARMACIST = "pharmacist",
	LAB_TECHNICIAN = "lab_technician",
	STORE_KEEPER = "store_keeper",
	STUDENT = "student"
}

export interface Student {
	id: number;
	id_number: string;
	email: string;
	name: string;
	branch?: string;
	section?: string;
}

export interface Medicine {
  total_cost: any;
  cost: any;
  brand: string;
	id: number;
	name: string;
	category?: string;
	quantity: number;
	expiry_date?: string;
}

export interface InventoryItem {
	id: number;
	name: string;
	category: string;
	quantity: number;
	created_at: string;
	updated_at?: string;
}

export interface Prescription {
  other_name: ReactNode;
	id: number;
	student_id: number;
	nurse_id: number;
	doctor_id?: number;
	nurse_notes?: string;
	doctor_notes?: string;
	nurse_image_url?: string;
	doctor_image_url?: string;
	audio_url?: string;
	weight?: string;
	bp?: string;
	temperature?: string;
	age?: number;
	status: string;
	created_at: string;
	updated_at?: string;
}

export interface LabReport {
	id: number;
	prescription_id: number;
	test_name: string;
	status: string;
	result?: string;
	created_at: string;
	updated_at?: string;
}

export interface DashboardStats {
	totalPatientsToday: number;
	totalPrescriptions: number;
	pendingLabTests: number;
	lowStockMedicines: number;
	activeUsers: number;
	totalStudents: number;
	totalStockValue: number;
}

export interface MedicineAnalytics {
	name: string;
	prescriptionCount: number;
	stockLevel: number;
}

export interface AnomalyAlert {
	id: string;
	type: string;
	severity: 'low' | 'medium' | 'high';
	message: string;
	timestamp: string;
	details?: string;
}

export interface AnomalyResponse {
  anomalies: AnomalyAlert[];
}
