import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) =>
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
        }),
      setTokens: (token, refreshToken) =>
        set({
          token,
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: !!token,
        }),
      setUser: (user) => set({ user, isAuthenticated: !!get().token }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'linkedin-content-auth',
      partialize: (state) => ({ 
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: !!state.token,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore isAuthenticated based on token or refreshToken presence
        if (state) {
          state.isAuthenticated = !!(state.token || state.refreshToken);
        }
      },
    }
  )
);
