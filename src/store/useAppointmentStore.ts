import { create } from 'zustand';
import type { Appointment, AppointmentType, AppointmentTimeSlot, AppointmentStatus, Clue } from '@/types';
import { mockAppointments } from '@/mock';

interface CreateAppointmentParams {
  clueId: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: AppointmentTimeSlot;
  type: AppointmentType;
  notes?: string;
  designatedDoctor?: string;
  designatedEquipment?: string;
}

interface AppointmentState {
  appointments: Appointment[];
  createAppointment: (params: CreateAppointmentParams, createdBy: string) => Appointment;
  getAppointmentsByStore: (storeId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getAppointmentsByDoctorAndDate: (doctorId: string, date: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getTodayAppointments: (storeId?: string) => Appointment[];
  updateAppointmentStatus: (id: string, status: AppointmentStatus, updatedBy: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: mockAppointments as Appointment[],

  createAppointment: (params, createdBy) => {
    const newAppointment: Appointment = {
      id: `a${Date.now()}`,
      clueId: params.clueId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      storeId: params.storeId,
      date: params.date,
      timeSlot: params.timeSlot,
      type: params.type,
      status: 'scheduled',
      notes: params.notes,
      designatedDoctor: params.designatedDoctor,
      designatedEquipment: params.designatedEquipment,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      appointments: [...state.appointments, newAppointment],
    }));

    return newAppointment;
  },

  getAppointmentsByStore: (storeId) => {
    return get().appointments.filter(a => a.storeId === storeId);
  },

  getAppointmentsByDoctor: (doctorId) => {
    return get().appointments.filter(a => a.doctorId === doctorId);
  },

  getAppointmentsByDoctorAndDate: (doctorId, date) => {
    return get().appointments.filter(a => a.doctorId === doctorId && a.date === date);
  },

  getAppointmentsByDate: (date) => {
    return get().appointments.filter(a => a.date === date);
  },

  getTodayAppointments: (storeId) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return get().appointments.filter(a => {
      if (storeId && a.storeId !== storeId) return false;
      return a.date === todayStr && a.status !== 'cancelled';
    });
  },

  updateAppointmentStatus: (id, status, updatedBy) => {
    set(state => ({
      appointments: state.appointments.map(a =>
        a.id === id
          ? { ...a, status, updatedAt: new Date().toISOString() }
          : a
      ),
    }));
  },

  getAppointmentById: (id) => {
    return get().appointments.find(a => a.id === id);
  },
}));
