import type { IContract } from "@/interface/contract";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { contracts } from "@/mock/contracts";

function getData(): IContract[] {
  return contracts;
}

export default function ContractsPage() {
  const data = getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
