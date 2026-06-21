import { create } from 'zustand';
import type { Rule } from '@/types';
import { mockRules } from '@/mock';

interface RuleState {
  rules: Rule[];
  addRule: (rule: Omit<Rule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  getRuleByCityAndProject: (city: string, project: string) => Rule | undefined;
  getRulesByCity: (city: string) => Rule[];
}

export const useRuleStore = create<RuleState>((set, get) => ({
  rules: mockRules,
  addRule: (rule) => {
    const newRule = { ...rule, id: `r${Date.now()}` };
    set(state => ({ rules: [...state.rules, newRule] }));
  },
  updateRule: (id, updates) => {
    set(state => ({
      rules: state.rules.map(r => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },
  deleteRule: (id) => {
    set(state => ({ rules: state.rules.filter(r => r.id !== id) }));
  },
  getRuleByCityAndProject: (city, project) => {
    return get().rules.find(r => r.city === city && r.project === project);
  },
  getRulesByCity: (city) => {
    return get().rules.filter(r => r.city === city);
  },
}));
