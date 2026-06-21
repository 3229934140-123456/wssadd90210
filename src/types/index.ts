export type UserRole = 'admin' | 'storeManager' | 'consultant' | 'scheduler';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  storeId?: string;
  avatar?: string;
}

export type SourcePlatform = 'meituan' | 'xinyang';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  age?: number;
  gender?: 'male' | 'female';
  sourcePlatform: SourcePlatform;
  createdAt: string;
  isDuplicate: boolean;
  duplicateWith?: string;
  avatar?: string;
}

export type ClueStatus = 'pending' | 'accepted' | 'transferring' | 'visited' | 'lost';
export type IntentionLevel = 'high' | 'medium' | 'low';

export interface Clue {
  id: string;
  customerId: string;
  customer: Customer;
  storeId: string;
  project: string;
  intentionLevel: IntentionLevel;
  status: ClueStatus;
  assignedTo?: string;
  consultantName?: string;
  createdAt: string;
  acceptedAt?: string;
  chatSummary: string;
  preferences: string[];
  designatedDoctor?: string;
  designatedEquipment?: string;
  isRecommended: boolean;
  responseTime?: number;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentLoad: number;
  manager: string;
  phone: string;
}

export type TransferStatus = 'pending' | 'approved' | 'rejected';

export interface TransferRecord {
  id: string;
  clueId: string;
  clue: Clue;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  reason: string;
  status: TransferStatus;
  approver?: string;
  createdAt: string;
  approvedAt?: string;
  chatSummarySnapshot: string;
  preferencesSnapshot: string[];
}

export interface Doctor {
  id: string;
  name: string;
  storeId: string;
  specialty: string;
  title: string;
  avatar?: string;
}

export type AppointmentType = 'consult' | 'treatment' | 'surgery' | 'review';
export type AppointmentTimeSlot = '09:00' | '10:00' | '11:00' | '14:00' | '15:00' | '16:00' | '17:00';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clueId: string;
  customerName: string;
  customerPhone: string;
  doctorId: string;
  doctorName: string;
  storeId: string;
  date: string;
  timeSlot: AppointmentTimeSlot;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  designatedDoctor?: string;
  designatedEquipment?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Rule {
  id: string;
  city: string;
  project: string;
  defaultStoreId: string;
  defaultStoreName: string;
  autoAssignRadius: number;
  requireApproval: boolean;
  responseTimeLimit: number;
}

export interface DailyStat {
  date: string;
  clueCount: number;
  acceptedCount: number;
  visitedCount: number;
  transferCount: number;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  city: string;
  totalClues: number;
  acceptedCount: number;
  avgResponseTime: number;
  saturationRate: number;
  transferCount: number;
}

export type AlertLevel = 'normal' | 'warning' | 'danger';

export interface StoreAlert {
  id: string;
  storeId: string;
  storeName: string;
  type: string;
  level: AlertLevel;
  message: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: string;
  senderType: 'customer' | 'consultant';
  content: string;
  timestamp: string;
}

export type ExportType = 'reports' | 'clues' | 'customers';
export type ExportStatus = 'pending' | 'approved' | 'rejected';

export interface ExportRequest {
  id: string;
  type: ExportType;
  reason: string;
  requesterName: string;
  requesterRole: string;
  storeId?: string;
  status: ExportStatus;
  approver?: string;
  approvedAt?: string;
  rejectReason?: string;
  createdAt: string;
  approved: boolean;
}
