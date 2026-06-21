import { create } from 'zustand';
import type { Store } from '@/types';
import { mockStores } from '@/mock';

interface StoreState {
  stores: Store[];
  getStoreById: (id: string) => Store | undefined;
  getStoresByCity: (city: string) => Store[];
  getStoreSaturation: (id: string) => number;
  getAllCities: () => string[];
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: mockStores,
  getStoreById: (id) => get().stores.find(s => s.id === id),
  getStoresByCity: (city) => get().stores.filter(s => s.city === city),
  getStoreSaturation: (id) => {
    const store = get().stores.find(s => s.id === id);
    if (!store) return 0;
    return Math.round((store.currentLoad / store.capacity) * 100);
  },
  getAllCities: () => {
    const cities = new Set(get().stores.map(s => s.city));
    return Array.from(cities);
  },
}));
