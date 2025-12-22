import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { IContract } from "@/interface/contract";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<IContract>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "operator",
    header: "Operator",
  },
  {
    accessorKey: "contractorName",
    header: "Contractor Name",
  },
  {
    accessorKey: "contractTitle",
    header: "Contract Title",
    // Optional: increase cell width for longer text
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.getValue("contractTitle")}>
        {row.getValue("contractTitle")}
      </div>
    ),
  },
  {
    accessorKey: "year",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("year")}</div>,
  },
  {
    accessorKey: "contractNumber",
    header: "Contract Number",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    // Optional: format date for better readability
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "contractValue",
    header: "Contract Value",
    cell: ({ row }) => {
      const value = row.getValue("contractValue") as number;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(value);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colorMap = {
        active: "text-green-600 bg-green-100",
        completed: "text-blue-600 bg-blue-100",
        pending: "text-yellow-600 bg-yellow-100",
        cancelled: "text-red-600 bg-red-100",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            colorMap[status as keyof typeof colorMap] ||
            "bg-gray-100 text-gray-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
];
