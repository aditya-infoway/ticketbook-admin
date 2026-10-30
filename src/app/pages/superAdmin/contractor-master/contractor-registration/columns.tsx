// src/app/pages/superAdmin/contractor-master/contractor-registration/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { Contractor } from "../shared/types";

const RowActions = createRowActions<Contractor>("contractor");

export const columns: ColumnDef<Contractor>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "contractorName",
    accessorKey: "contractorName",
    header: "Contractor Name",
    cell: TextCell,
  },
  {
    id: "companyName",
    accessorKey: "companyName",
    header: "Company",
    cell: TextCell,
  },
  {
    id: "mobileNumber",
    accessorKey: "mobileNumber",
    header: "Mobile",
    cell: TextCell,
  },
  {
    id: "areaName",
    accessorKey: "areaName",
    header: "Area",
    cell: TextCell,
  },
  {
    id: "branchName",
    accessorKey: "branchName",
    header: "Branch",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const statusStr = String(row.original.status || "").toLowerCase();
      const isActive = statusStr === "active" || statusStr === "1" || statusStr === "true";

      const handleToggle = () => {
        (table.options.meta as any)?.toggleStatus?.(row.original);
      };

      return (
        <button
          type="button"
          onClick={handleToggle}
          className={`focus-visible:ring-primary-500 relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isActive ? "bg-primary-500" : "bg-gray-300 dark:bg-dark-600"
          }`}
          title={`Mark as ${isActive ? "Inactive" : "Active"}`}
        >
          <span
            className={`inline-block size-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Contractor>[] = [
  { key: "contractorName", header: "Contractor Name" },
  { key: "companyName", header: "Company" },
  { key: "mobileNumber", header: "Mobile" },
  { key: "areaName", header: "Area" },
  { key: "branchName", header: "Branch" },
  { key: "status", header: "Status" },
];