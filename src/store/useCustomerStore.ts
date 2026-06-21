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
  mergedMap: Record<string, string>;
  getCustomerById: (id: string) => Customer | undefined;
  findDuplicateByPhone: (phone: string, excludeId?: string) => Customer[];
  getDuplicateCustomers: () => DuplicateCustomerGroup[];
  getCustomersByPhone: (phone: string) => Customer[];
  mergeCustomers: (primaryId: string, duplicateId: string) => void;
  searchCustomers: (keyword: string) => Customer[];
  getCustomerClueCount: (customerId: string) => number;
  getEffectiveCustomerId: (customerId: string) => string;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: mockCustomers,
  mergedMap: {},

  getCustomerById: (id) => {
    const state = get();
    const effectiveId = state.mergedMap[id] || id;
    return state.customers.find(c => c.id === effectiveId);
  },

  getEffectiveCustomerId: (customerId) => {
    const merged = get().mergedMap;
    let result = customerId;
    while (merged[result]) {
      result = merged[result];
    }
    return result;
  },

  findDuplicateByPhone: (phone, excludeId) => {
    const { customers, mergedMap, getEffectiveCustomerId } = get();
    const excludeEffective = excludeId ? getEffectiveCustomerId(excludeId) : null;

    return customers.filter(c => {
      if (c.phone !== phone) return false;
      const effId = getEffectiveCustomerId(c.id);
      if (excludeEffective && effId === excludeEffective) return false;
      return true;
    });
  },

  getDuplicateCustomers: () => {
    const { customers, mergedMap, getEffectiveCustomerId } = get();
    const { useClueStore } = require('@/store/useClueStore');
    const clues = useClueStore.getState().clues;

    const phoneMap = new Map<string, Customer[]>();

    customers.forEach(c => {
      const effId = getEffectiveCustomerId(c.id);
      if (effId !== c.id) return;
      if (!phoneMap.has(c.phone)) {
        phoneMap.set(c.phone, []);
      }
      phoneMap.get(c.phone)!.push(c);
    });

    const groups: DuplicateCustomerGroup[] = [];
    phoneMap.forEach(group => {
      if (group.length < 2) return;
      const platforms = new Set(group.map(c => c.sourcePlatform));
      if (!platforms.has('meituan') || !platforms.has('xinyang')) return;

      const sorted = [...group].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const primary = sorted[0];
      const duplicates = sorted.slice(1);

      const allClueCount = clues.filter((clue: any) => {
        const effCustId = getEffectiveCustomerId(clue.customerId);
        return [primary.id, ...duplicates.map(d => d.id)].includes(effCustId);
      }).length;

      groups.push({
        phone: group[0].phone,
        primary,
        duplicates,
        totalClueCount: allClueCount,
      });
    });

    return groups;
  },

  getCustomersByPhone: (phone) => {
    return get().customers.filter(c => c.phone.includes(phone));
  },

  mergeCustomers: (primaryId, duplicateId) => {
    if (primaryId === duplicateId) return;

    set(state => {
      const dupEffective = state.mergedMap;
      dupEffective[duplicateId] = primaryId;

      return {
        mergedMap: { ...dupEffective },
        customers: state.customers.map(c => {
          if (c.id === duplicateId) {
            return { ...c, isDuplicate: false, duplicateWith: primaryId };
          }
          if (c.id === primaryId) {
            return { ...c, isDuplicate: false, duplicateWith: undefined };
          }
          return c;
        }),
      };
    });
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
    const { getEffectiveCustomerId } = get();
    const effId = getEffectiveCustomerId(customerId);
    const clues = useClueStore.getState().clues;

    return clues.filter((c: any) => {
      const clueEffId = getEffectiveCustomerId(c.customerId);
      return clueEffId === effId;
    }).length;
  },
}));
