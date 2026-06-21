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

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clueId: string;
  customerName: string;
  doctorId: string;
  doctorName: string;
  storeId: string;
  appointmentTime: string;
  type: string;
  status: AppointmentStatus;
  notes: string;
  designatedEquipment?: string;
  createdAt: string;
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
