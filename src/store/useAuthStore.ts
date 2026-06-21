import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { mockUsers } from '@/mock';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: mockUsers[0],
  isLoggedIn: true,
  login: (username, _password, role) => {
    let user = mockUsers.find(u => u.username === username);
    if (!user && role) {
      user = mockUsers.find(u => u.role === role);
    }
    if (user) {
      set({ user, isLoggedIn: true });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ user: null, isLoggedIn: false });
  },
  hasPermission: (roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
