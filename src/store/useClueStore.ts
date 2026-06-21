import { create } from 'zustand';
import type { Clue, ClueStatus, IntentionLevel } from '@/types';
import { mockClues } from '@/mock';

interface ClueState {
  clues: Clue[];
  selectedClue: Clue | null;
  filters: {
    status?: ClueStatus;
    intentionLevel?: IntentionLevel;
    project?: string;
    storeId?: string;
    keyword?: string;
  };
  setFilters: (filters: Partial<ClueState['filters']>) => void;
  setSelectedClue: (clue: Clue | null) => void;
  getFilteredClues: () => Clue[];
  acceptClue: (clueId: string, consultantName: string) => void;
  updateClue: (clueId: string, updates: Partial<Clue>) => void;
  getClueById: (id: string) => Clue | undefined;
  getPendingCount: (storeId?: string) => number;
}

export const useClueStore = create<ClueState>((set, get) => ({
  clues: mockClues,
  selectedClue: null,
  filters: {},
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setSelectedClue: (clue) => set({ selectedClue: clue }),
  getFilteredClues: () => {
    const { clues, filters } = get();
    return clues.filter(clue => {
      if (filters.status && clue.status !== filters.status) return false;
      if (filters.intentionLevel && clue.intentionLevel !== filters.intentionLevel) return false;
      if (filters.project && clue.project !== filters.project) return false;
      if (filters.storeId && clue.storeId !== filters.storeId) return false;
      if (filters.keyword && !clue.customer.name.includes(filters.keyword) && !clue.project.includes(filters.keyword)) return false;
      return true;
    });
  },
  acceptClue: (clueId, consultantName) => {
    set(state => ({
      clues: state.clues.map(clue =>
        clue.id === clueId
          ? { ...clue, status: 'accepted', acceptedAt: new Date().toISOString(), consultantName, responseTime: 5 }
          : clue
      ),
    }));
  },
  updateClue: (clueId, updates) => {
    set(state => ({
      clues: state.clues.map(clue =>
        clue.id === clueId ? { ...clue, ...updates } : clue
      ),
    }));
  },
  getClueById: (id) => {
    return get().clues.find(c => c.id === id);
  },
  getPendingCount: (storeId) => {
    const { clues } = get();
    return clues.filter(c => c.status === 'pending' && (!storeId || c.storeId === storeId)).length;
  },
}));
