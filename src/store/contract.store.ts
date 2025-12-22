import { create } from "zustand";
import { api } from "@/config/axios";
import type { IContract } from "@/interface/contract";

interface ContractInput {
  operator: string;
  contractorName: string;
  contractTitle: string;
  year: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  contractValue: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
}

interface ContractFilters {
  operator?: string;
  year?: number;
  contractorName?: string;
  hasDocument?: boolean;
  page?: number;
  limit?: number;
}

interface ContractState {
  contracts: IContract[];
  currentContract: IContract | null;
  pagination: PaginationData;
  isLoading: boolean;
  error: string | null;

  fetchContracts: (filters?: ContractFilters) => Promise<void>;
  fetchContractById: (id: string) => Promise<void>;
  createContract: (data: ContractInput, files?: File[]) => Promise<boolean>;
  updateContract: (
    id: string,
    data: Partial<ContractInput>
  ) => Promise<boolean>;
  deleteContract: (id: string) => Promise<boolean>;
  searchContracts: (query: string) => Promise<void>;
  clearError: () => void;
  clearCurrentContract: () => void;
}

export const useContractStore = create<ContractState>()((set) => ({
  contracts: [],
  currentContract: null,
  pagination: { total: 0, page: 1, limit: 10 },
  isLoading: false,
  error: null,

  fetchContracts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.operator) params.append("operator", filters.operator);
      if (filters.year) params.append("year", filters.year.toString());
      if (filters.contractorName)
        params.append("contractorName", filters.contractorName);
      if (filters.hasDocument !== undefined)
        params.append("hasDocument", filters.hasDocument.toString());

      const { data } = await api.get(`/contracts?${params.toString()}`);
      if (data.success) {
        set({
          contracts: data.data.contracts,
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
        error: error.response?.data?.message || "Failed to fetch contracts",
        isLoading: false,
      });
    }
  },

  fetchContractById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/contracts/${id}`);
      if (data.success) {
        set({ currentContract: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to fetch contract",
        isLoading: false,
      });
    }
  },

  createContract: async (contractData, files) => {
    set({ isLoading: true, error: null });
    try {
      const hasDocument = files && files.length > 0;

      // Create the contract with hasDocument flag
      const { data } = await api.post("/contracts", {
        ...contractData,
        hasDocument,
      });
      if (!data.success) {
        set({ error: data.message, isLoading: false });
        return false;
      }

      const contractId = data.data._id;

      // Upload files if provided
      if (hasDocument) {
        const formData = new FormData();
        files!.forEach((file) => formData.append("files", file));
        formData.append("contractId", contractId);

        await api.post("/media/multiple", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      set((state) => ({
        contracts: [data.data, ...state.contracts],
        isLoading: false,
      }));
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Failed to create contract",
        isLoading: false,
      });
      return false;
    }
  },

  updateContract: async (id, contractData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/contracts/${id}`, contractData);
      if (data.success) {
        set((state) => ({
          contracts: state.contracts.map((c) => (c.id === id ? data.data : c)),
          currentContract:
            state.currentContract?.id === id
              ? data.data
              : state.currentContract,
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
        error: error.response?.data?.message || "Failed to update contract",
        isLoading: false,
      });
      return false;
    }
  },

  deleteContract: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/contracts/${id}`);
      if (data.success) {
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
          currentContract:
            state.currentContract?.id === id ? null : state.currentContract,
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
        error: error.response?.data?.message || "Failed to delete contract",
        isLoading: false,
      });
      return false;
    }
  },

  searchContracts: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(
        `/contracts/search?q=${encodeURIComponent(query)}`
      );
      if (data.success) {
        set({ contracts: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || "Search failed",
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentContract: () => set({ currentContract: null }),
}));
