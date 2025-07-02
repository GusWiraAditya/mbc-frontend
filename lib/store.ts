import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getAuthenticatedUser,
  logout as apiLogout,
  User,
  checkAuthStatus,
} from "./auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isInitialized: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isAuthLoading: true });

    try {
      const { isAuthenticated, user } = await checkAuthStatus();

      if (isAuthenticated && user) {
        const userWithRoles = { ...user.user, roles: user.roles };
        set({
          user: userWithRoles,
          isAuthenticated: true,
          isAuthLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isAuthLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
        isInitialized: true,
      });
    }
  },

  fetchUser: async () => {
    set({ isAuthLoading: true });

    try {
      const authenticatedData = await getAuthenticatedUser();
      const userWithRoles = {
        ...authenticatedData.user,
        roles: authenticatedData.roles,
      };
      set({
        user: userWithRoles,
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch (error) {
      console.error("Fetch user failed:", error);
      set({
        user: null,
        isAuthenticated: false,
        isAuthLoading: false,
      });
      throw error;
    }
  },

  // Ini adalah logika logout yang benar dan andal dari Canvas Anda.
  logout: async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API call failed, but proceeding with client-side state clearing.", error);
    } finally {
      // Hanya reset state. Komponen yang memanggil akan menangani redirect.
      set({ user: null, isAuthenticated: false, isAuthLoading: false, isInitialized: false });
    }
  },

  reset: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
      isInitialized: false,
    });
  },
}));
