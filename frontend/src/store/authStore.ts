import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem("cv_access_token", accessToken);
    localStorage.setItem("cv_refresh_token", refreshToken);
    localStorage.setItem("cv_user", JSON.stringify(user));
    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("cv_access_token");
    localStorage.removeItem("cv_refresh_token");
    localStorage.removeItem("cv_user");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem("cv_user", JSON.stringify(updated));
      set({ user: updated });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  initialize: () => {
    const token = localStorage.getItem("cv_access_token");
    const refresh = localStorage.getItem("cv_refresh_token");
    const userStr = localStorage.getItem("cv_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, accessToken: token, refreshToken: refresh, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
