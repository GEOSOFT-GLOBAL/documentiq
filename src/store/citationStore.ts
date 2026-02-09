import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface GenerateCitationRequest {
  sourceType: string;
  citationStyle: string;
  sourceInfo: string;
  useAI: boolean;
}

interface GenerateCitationResult {
  citation: string;
  sourceType: string;
  citationStyle: string;
}

interface GenerateCitationFromDocumentRequest {
  documentContent?: string;
  documentName: string;
  citationStyle: string;
  pdfMetadata?: {
    title?: string;
    author?: string;
    creationDate?: string;
    subject?: string;
    keywords?: string;
    doi?: string;
    isbn?: string;
    pageCount?: number;
  };
}

interface GenerateCitationFromDocumentResult {
  citation: string;
  citationStyle: string;
}

interface GenerateCitationFromURLRequest {
  url: string;
  citationStyle: string;
}

interface GenerateCitationFromURLResult {
  citation: string;
  citationStyle: string;
}

interface ConvertCitationsRequest {
  citations: string;
  sourceStyle: string;
  targetStyle: string;
}

interface ConvertCitationsResult {
  convertedCitations: string;
  sourceStyle: string;
  targetStyle: string;
}

interface CitationState {
  isLoading: boolean;
  error: string | null;

  // Generate citation
  generateCitation: (
    request: GenerateCitationRequest
  ) => Promise<GenerateCitationResult>;

  // Generate citation from document
  generateCitationFromDocument: (
    request: GenerateCitationFromDocumentRequest
  ) => Promise<GenerateCitationFromDocumentResult>;

  // Generate citation from URL
  generateCitationFromURL: (
    request: GenerateCitationFromURLRequest
  ) => Promise<GenerateCitationFromURLResult>;

  // Convert citations
  convertCitations: (
    request: ConvertCitationsRequest
  ) => Promise<ConvertCitationsResult>;

  // Clear error
  clearError: () => void;
}

export const useCitationStore = create<CitationState>((set) => ({
  isLoading: false,
  error: null,

  generateCitation: async (request: GenerateCitationRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/research/citation/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to generate citation");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to generate citation";
      set({ error, isLoading: false });
      throw err;
    }
  },

  generateCitationFromDocument: async (
    request: GenerateCitationFromDocumentRequest
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${API_BASE}/docxiq/research/citation/from-document`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.message || "Failed to generate citation from document"
        );
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : "Failed to generate citation from document";
      set({ error, isLoading: false });
      throw err;
    }
  },

  generateCitationFromURL: async (request: GenerateCitationFromURLRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${API_BASE}/docxiq/research/citation/from-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to generate citation from URL");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : "Failed to generate citation from URL";
      set({ error, isLoading: false });
      throw err;
    }
  },

  convertCitations: async (request: ConvertCitationsRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${API_BASE}/docxiq/research/citation/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to convert citations");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to convert citations";
      set({ error, isLoading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
