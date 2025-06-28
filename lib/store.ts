import { create } from 'zustand';
import { getAuthenticatedUser, logout as apiLogout, User, AuthenticatedUser } from './auth';
import axios from 'axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  fetchUser: async () => {
    try {
      const authenticatedData = await getAuthenticatedUser();
      const userWithRoles = {
          ...authenticatedData.user,
          roles: authenticatedData.roles,
      };
      set({ user: userWithRoles, isAuthenticated: true });
    } catch (error) {
      // REVISI: Menganggap kegagalan fetch sebagai kondisi normal untuk guest.
      // Kita tidak perlu menampilkan pesan error yang mengkhawatirkan di console.
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Ini adalah kasus yang diharapkan jika user belum login.
        // console.log("Session not found, user is a guest.");
      } else {
        // Jika errornya bukan 401, mungkin ada masalah lain yang perlu dicatat.
        console.error("An unexpected error occurred while fetching user:", error);
      }
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: async () => {
    try {
      await apiLogout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout failed in store:", error);
    }
  },
}));
