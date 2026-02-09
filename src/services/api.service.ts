const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface SummarizeTextRequest {
  text: string;
  summaryLength?: "short" | "medium" | "long";
  summaryFormat?: "paragraph" | "bullets" | "key-points";
  detailLevel?: number;
}

export interface SummarizeTextResponse {
  summary: string;
  summaryLength: string;
  summaryFormat: string;
  detailLevel: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || `API error: ${response.statusText}`);
      }

      return json.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }

  async summarizeText(
    request: SummarizeTextRequest
  ): Promise<SummarizeTextResponse> {
    return this.request<SummarizeTextResponse>(
      "/docxiq/research/summarize",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }
}

export const apiService = new ApiService();
