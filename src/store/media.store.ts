import { create } from "zustand";
import { api } from "@/config/axios";

export interface IMedia {
  _id: string;
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  publicId: string;
  uploadedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  contractId?: {
    _id: string;
    contractTitle: string;
    contractNumber: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
}

interface MediaFilters {
  contractId?: string;
  uploadedBy?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

interface UploadOptions {
  uploadedBy?: string;
  contractId?: string;
  tags?: string[];
}

interface MediaState {
  media: IMedia[];
  currentMedia: IMedia | null;
  pagination: PaginationData;
  isLoading: boolean;
  uploadProgress: number;
  error: string | null;

  fetchMedia: (filters?: MediaFilters) => Promise<void>;
  fetchMediaById: (id: string) => Promise<void>;
  uploadFile: (file: File, options?: UploadOptions) => Promise<IMedia | null>;
  uploadMultipleFiles: (files: File[], options?: UploadOptions) => Promise<IMedia[]>;
  deleteMedia: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearCurrentMedia: () => void;
  setUploadProgress: (progress: number) => void;
}

export const useMediaStore = create<MediaState>()((set) => ({
  media: [],
  currentMedia: null,
  pagination: { total: 0, page: 1, limit: 10 },
  isLoading: false,
  uploadProgress: 0,
  error: null,

  fetchMedia: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.contractId) params.append("contractId", filters.contractId);
      if (filters.uploadedBy) params.append("uploadedBy", filters.uploadedBy);
      if (filters.tags) params.append("tags", filters.tags);

      const { data } = await api.get(`/media?${params.toString()}`);
      if (data.success) {
        set({
          media: data.data.media,
          pagination: {
            total: data.data.total,
            page: data.data.page,
            limit: data.data.limit,
          },
          isLoading: false,
        });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch media",
        isLoading: false,
      });
    }
  },


  fetchMediaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/media/${id}`);
      if (data.success) {
        set({ currentMedia: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch media",
        isLoading: false,
      });
    }
  },

  uploadFile: async (file, options = {}) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (options.uploadedBy) formData.append("uploadedBy", options.uploadedBy);
      if (options.contractId) formData.append("contractId", options.contractId);
      if (options.tags) formData.append("tags", JSON.stringify(options.tags));

      const { data } = await api.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          set({ uploadProgress: progress });
        },
      });

      if (data.success) {
        set((state) => ({
          media: [data.data, ...state.media],
          isLoading: false,
          uploadProgress: 100,
        }));
        return data.data;
      } else {
        set({ error: data.message, isLoading: false });
        return null;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to upload file",
        isLoading: false,
        uploadProgress: 0,
      });
      return null;
    }
  },

  uploadMultipleFiles: async (files, options = {}) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      if (options.uploadedBy) formData.append("uploadedBy", options.uploadedBy);
      if (options.contractId) formData.append("contractId", options.contractId);
      if (options.tags) formData.append("tags", JSON.stringify(options.tags));

      const { data } = await api.post("/media/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          set({ uploadProgress: progress });
        },
      });

      if (data.success) {
        set((state) => ({
          media: [...data.data, ...state.media],
          isLoading: false,
          uploadProgress: 100,
        }));
        return data.data;
      } else {
        set({ error: data.message, isLoading: false });
        return [];
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to upload files",
        isLoading: false,
        uploadProgress: 0,
      });
      return [];
    }
  },

  deleteMedia: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/media/${id}`);
      if (data.success) {
        set((state) => ({
          media: state.media.filter((m) => m._id !== id),
          currentMedia: state.currentMedia?._id === id ? null : state.currentMedia,
          isLoading: false,
        }));
        return true;
      } else {
        set({ error: data.message, isLoading: false });
        return false;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to delete media",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentMedia: () => set({ currentMedia: null }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
}));
