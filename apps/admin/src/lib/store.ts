import { create } from 'zustand';
import { User, mockUsers } from './mock-data';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: mockUsers['user-1'], // Initially logged in as a patient for testing
  isAuthenticated: true,
  login: (userId) => {
    const user = mockUsers[userId];
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
    }
  },
  logout: () => set({ currentUser: null, isAuthenticated: false }),
}));
