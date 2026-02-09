import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface SummarizeRequest {
  text: string;
  summaryLength?: "short" | "medium" | "long";
  summaryFormat?: "paragraph" | "bullets" | "key-points";
  detailLevel?: number;
}

interface SummarizeResult {
  summary: string;
  summaryLength: string;
  summaryFormat: string;
  detailLevel: number;
}

interface SummarizerState {
  isLoading: boolean;
  error: string | null;

  // Summarize text
  summarizeText: (request: SummarizeRequest) => Promise<SummarizeResult>;

  // Clear error
  clearError: () => void;
}

export const useSummarizerStore = create<SummarizerState>((set) => ({
  isLoading: false,
  error: null,

  summarizeText: async (request: SummarizeRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/research/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to summarize text");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to summarize text";
      set({ error, isLoading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
