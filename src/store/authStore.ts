import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
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
  registeredApps?: string[];
}

interface SignupData {
  email: string;
  password: string;
  username: string;
  firstname?: string;
  lastname?: string;
  linkAccount?: boolean;
}

export interface AccountLinkPrompt {
  existingApps: string[];
  prompt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  accountLinkPrompt: AccountLinkPrompt | null;
  signup: (data: SignupData) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  initiateGoogleAuth: () => Promise<void>;
  handleGoogleCallback: (code: string, state?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  clearAccountLinkPrompt: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      accountLinkPrompt: null,

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null, accountLinkPrompt: null });
        try {
          const res = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, appSource: APP_SOURCE }),
          });

          const json = await res.json();

          if (!res.ok || !json.success) {
            if (json.code === "ACCOUNT_EXISTS_LINK_PROMPT") {
              set({
                isLoading: false,
                accountLinkPrompt: {
                  existingApps: json.errorData?.existingApps || [],
                  prompt:
                    json.errorData?.prompt || "Account exists. Link accounts?",
                },
              });
              throw new Error("ACCOUNT_LINK_REQUIRED");
            }
            throw new Error(json.message || "Signup failed");
          }

          set({
            user: json.data.user,
            token: json.data.accessToken,
            isLoading: false,
          });
        } catch (err) {
          if (err instanceof Error && err.message !== "ACCOUNT_LINK_REQUIRED") {
            set({
              error: err.message,
              isLoading: false,
            });
          }
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
          const res = await fetch(`${API_BASE}/auth/google?appSource=${APP_SOURCE}`);
          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to initiate Google auth");
          }

          // Store state in session storage for CSRF protection
          if (json.data.state) {
            sessionStorage.setItem('oauth_state', json.data.state);
          }

          window.location.href = json.data.authUrl;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Google auth failed",
            isLoading: false,
          });
          throw err;
        }
      },

      handleGoogleCallback: async (code: string, state?: string) => {
        set({ isLoading: true, error: null });
        try {
          // Validate state parameter for CSRF protection
          const storedState = sessionStorage.getItem('oauth_state');
          if (storedState) {
            // If we have a stored state, the callback must include it
            if (!state) {
              throw new Error("Missing state parameter. Possible CSRF attack.");
            }
            if (state !== storedState) {
              throw new Error("Invalid state parameter. Possible CSRF attack.");
            }
            // Clear stored state after validation
            sessionStorage.removeItem('oauth_state');
          }

          // Build query parameters
          const params = new URLSearchParams({
            code,
            appSource: APP_SOURCE,
          });

          if (state) {
            params.append('state', state);
          }

          const res = await fetch(
            `${API_BASE}/auth/google/callback?${params.toString()}`
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
        set({ user: null, token: null, error: null, accountLinkPrompt: null });
      },

      clearError: () => {
        set({ error: null });
      },

      clearAccountLinkPrompt: () => {
        set({ accountLinkPrompt: null });
      },
    }),
    {
      name: "docxiq-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
