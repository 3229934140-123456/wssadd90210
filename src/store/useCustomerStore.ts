import { create } from 'zustand';
import type { Customer } from '@/types';
import { mockCustomers } from '@/mock';

export interface DuplicateCustomerGroup {
  phone: string;
  primary: Customer;
  duplicates: Customer[];
  totalClueCount: number;
}

interface CustomerState {
  customers: Customer[];
  getCustomerById: (id: string) => Customer | undefined;
  findDuplicateByPhone: (phone: string, excludeId?: string) => Customer[];
  getDuplicateCustomers: () => DuplicateCustomerGroup[];
  getCustomersByPhone: (phone: string) => Customer[];
  mergeCustomers: (primaryId: string, duplicateId: string) => void;
  searchCustomers: (keyword: string) => Customer[];
  getCustomerClueCount: (customerId: string) => number;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: mockCustomers,

  getCustomerById: (id) => {
    return get().customers.find(c => c.id === id);
  },

  findDuplicateByPhone: (phone, excludeId) => {
    return get().customers.filter(c => c.phone === phone && c.id !== excludeId);
  },

  getDuplicateCustomers: () => {
    const { customers } = get();
    const { useClueStore } = require('@/store/useClueStore');
    const clues = useClueStore.getState().clues;
    const phoneMap = new Map<string, Customer[]>();
    
    customers.forEach(c => {
      if (!phoneMap.has(c.phone)) {
        phoneMap.set(c.phone, []);
      }
      phoneMap.get(c.phone)!.push(c);
    });

    const groups: DuplicateCustomerGroup[] = [];
    phoneMap.forEach(group => {
      if (group.length > 1) {
        const sorted = [...group].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const primary = sorted[0];
        const duplicates = sorted.slice(1);
        const allIds = group.map(c => c.id);
        const clueCount = clues.filter((c: any) => allIds.includes(c.customerId)).length;
        
        groups.push({
          phone: group[0].phone,
          primary,
          duplicates,
          totalClueCount: clueCount,
        });
      }
    });

    return groups;
  },

  getCustomersByPhone: (phone) => {
    return get().customers.filter(c => c.phone.includes(phone));
  },

  mergeCustomers: (primaryId, duplicateId) => {
    set(state => ({
      customers: state.customers.map(c => {
        if (c.id === primaryId) {
          return { ...c, isDuplicate: false, duplicateWith: undefined };
        }
        if (c.id === duplicateId) {
          return { ...c, isDuplicate: false, duplicateWith: primaryId };
        }
        return c;
      }),
    }));
  },

  searchCustomers: (keyword) => {
    const lower = keyword.toLowerCase();
    return get().customers.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.phone.includes(keyword)
    );
  },

  getCustomerClueCount: (customerId) => {
    const { useClueStore } = require('@/store/useClueStore');
    return useClueStore.getState().clues.filter(c => c.customerId === customerId).length;
  },
}));
