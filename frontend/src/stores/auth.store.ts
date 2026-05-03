import { create } from 'zustand';
import type { AuthUser } from '../types/auth.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setSession: (user, accessToken, refreshToken) => {
    set({ user, accessToken, refreshToken });
  },

  clearSession: () => {
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
