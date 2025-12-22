import { create } from "zustand";
import { api } from "@/config/axios";
import { type IAuthUser } from "@/interface/user";

interface AuthState {
  user: IAuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  signin: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  verifyAccount: (userId: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: IAuthUser, accessToken: string, refreshToken: string) => void;
  clearError: () => void;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  signin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/signin", { email, password });
      if (data.success) {
        set({
          user: data.data.user,
          accessToken: data.data.token,
          refreshToken: data.data?.refreshToken,
          isLoading: false,
        });
        console.log(data);
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Sign in failed",
        isLoading: false,
      });
      return false;
    }
  },

  signup: async (signupData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/signup", signupData);
      if (data.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Sign up failed",
        isLoading: false,
      });
      return false;
    }
  },

  verifyAccount: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/verify", { userId });
      if (data.success) {
        set({ isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Verification failed",
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, accessToken, refreshToken });
  },

  clearError: () => set({ error: null }),
}));
