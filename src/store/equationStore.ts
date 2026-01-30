import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface ParsedEquation {
  parsed: string;
  inputFormat: string;
}

interface ConvertedEquation {
  originalEquation: string;
  convertedEquation: string;
  sourceFormat: string;
  targetFormat: string;
}

interface SolvedEquation {
  equation: string;
  solution: string;
  solveFor?: string;
  showSteps: boolean;
}

interface SimplifiedEquation {
  originalEquation: string;
  simplifiedEquation: string;
  showSteps: boolean;
}

interface BatchConvertResult {
  convertedEquations: string;
  sourceFormat: string;
  targetFormat: string;
  count: number;
}

interface ValidationResult {
  equation: string;
  format: string;
  validation: string;
}

interface EquationState {
  isLoading: boolean;
  error: string | null;
  
  // Parse equation
  parseEquation: (equation: string, inputFormat?: string) => Promise<ParsedEquation>;
  
  // Convert equation
  convertEquation: (
    equation: string,
    sourceFormat: string,
    targetFormat: string
  ) => Promise<ConvertedEquation>;
  
  // Batch convert
  batchConvertEquations: (
    equations: string[],
    sourceFormat: string,
    targetFormat: string
  ) => Promise<BatchConvertResult>;
  
  // Solve equation
  solveEquation: (
    equation: string,
    solveFor?: string,
    showSteps?: boolean
  ) => Promise<SolvedEquation>;
  
  // Simplify equation
  simplifyEquation: (
    equation: string,
    showSteps?: boolean
  ) => Promise<SimplifiedEquation>;
  
  // Validate equation
  validateEquation: (
    equation: string,
    format?: string
  ) => Promise<ValidationResult>;
  
  // Clear error
  clearError: () => void;
}

export const useEquationStore = create<EquationState>((set) => ({
  isLoading: false,
  error: null,

  parseEquation: async (equation: string, inputFormat = "text") => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/equation/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation, inputFormat }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to parse equation");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to parse equation";
      set({ error, isLoading: false });
      throw err;
    }
  },

  convertEquation: async (
    equation: string,
    sourceFormat: string,
    targetFormat: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/equation/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation, sourceFormat, targetFormat }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to convert equation");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to convert equation";
      set({ error, isLoading: false });
      throw err;
    }
  },

  batchConvertEquations: async (
    equations: string[],
    sourceFormat: string,
    targetFormat: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/equation/batch-convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equations, sourceFormat, targetFormat }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to batch convert equations");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to batch convert equations";
      set({ error, isLoading: false });
      throw err;
    }
  },

  solveEquation: async (
    equation: string,
    solveFor?: string,
    showSteps = true
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/equation/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation, solveFor, showSteps }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to solve equation");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to solve equation";
      set({ error, isLoading: false });
      throw err;
    }
  },

  simplifyEquation: async (equation: string, showSteps = true) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/equation/simplify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation, showSteps }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to simplify equation");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to simplify equation";
      set({ error, isLoading: false });
      throw err;
    }
  },

  validateEquation: async (equation: string, format = "latex") => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/equation/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation, format }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to validate equation");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to validate equation";
      set({ error, isLoading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
