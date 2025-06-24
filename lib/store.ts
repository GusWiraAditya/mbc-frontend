import { create } from 'zustand';
import { getAuthenticatedUser, logout as apiLogout, AuthenticatedUser } from './auth';

// Tipe untuk state dan actions di dalam store
interface AuthState {
  user: AuthenticatedUser['user'] | null;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  /**
   * Mengambil data user yang sedang login dan memperbarui state.
   */
  fetchUser: async () => {
    try {
      const { user } = await getAuthenticatedUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error("No authenticated user found.");
      set({ user: null, isAuthenticated: false });
    }
  },

  /**
   * Proses logout, memanggil API dan membersihkan state.
   */
  logout: async () => {
    try {
      await apiLogout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout failed in store:", error);
    }
  },
}));
