export interface IContract {
  id: string;
  operator: string;
  contractorName: string;
  contractTitle: string;
  year: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  status: "active" | "completed" | "pending" | "cancelled";
  hasDocument: boolean;
};