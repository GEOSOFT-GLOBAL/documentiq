import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const APP_SOURCE = "docxiq";

export interface User {
  id: string;
  email: string;
  username: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
  role?: string;
  plan?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (data: SignupData) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  initiateGoogleAuth: () => Promise<void>;
  handleGoogleCallback: (code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface SignupData {
  email: string;
  password: string;
  username: string;
  firstname?: string;
  lastname?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, appSource: APP_SOURCE }),
          });

          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.message || "Signup failed");
          }

          set({
            user: json.data.user,
            token: json.data.accessToken,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Signup failed",
            isLoading: false,
          });
          throw err;
        }
      },

      signin: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.message || "Sign in failed");
          }

          set({
            user: json.data.user,
            token: json.data.accessToken,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Sign in failed",
            isLoading: false,
          });
          throw err;
        }
      },

      initiateGoogleAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/auth/google`);
          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to initiate Google auth");
          }

          // Redirect to Google OAuth
          window.location.href = json.data.authUrl;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Google auth failed",
            isLoading: false,
          });
          throw err;
        }
      },

      handleGoogleCallback: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(
            `${API_BASE}/auth/google/callback?code=${encodeURIComponent(code)}&appSource=${APP_SOURCE}`
          );
          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.message || "Google authentication failed");
          }

          set({
            user: json.data.user,
            token: json.data.accessToken,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Google auth failed",
            isLoading: false,
          });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "docxiq-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
