import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/lib/types/auth';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  setUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: UserProfile, token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      setUser: (updatedUser: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const merged = { ...currentUser, ...updatedUser };
        set({ user: merged });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'gadgetzone-auth',
    }
  )
);
