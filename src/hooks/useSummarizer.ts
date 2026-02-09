import { useState, useCallback } from "react";
import { apiService, type SummarizeTextRequest } from "@/services/api.service";

export interface UseSummarizerOptions {
  onSuccess?: (summary: string) => void;
  onError?: (error: string) => void;
}

export const useSummarizer = (options: UseSummarizerOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = useCallback(
    async (request: SummarizeTextRequest): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.summarizeText(request);

        setLoading(false);

        if (options.onSuccess) {
          options.onSuccess(response.summary);
        }

        return response.summary;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setLoading(false);

        if (options.onError) {
          options.onError(errorMessage);
        }

        throw err;
      }
    },
    [options],
  );

  return {
    summarize,
    loading,
    error,
  };
};
