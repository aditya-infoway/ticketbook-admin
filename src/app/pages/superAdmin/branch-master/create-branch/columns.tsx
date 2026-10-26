import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { Branch } from "./shared/types";

const RowActions = createRowActions<Branch>("branch");

export const columns: ColumnDef<Branch>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  { 
    id: "branchCode", 
    accessorKey: "branchCode", 
    header: "Branch Code", 
    cell: TextCell 
  },
  { 
    id: "branchName", 
    accessorKey: "branchName", 
    header: "Branch Name", 
    cell: TextCell 
  },
  { 
    id: "region", 
    accessorKey: "region", 
    header: "Region", 
    cell: TextCell 
  },
  { 
    id: "country", 
    accessorKey: "country", 
    header: "Country", 
    cell: TextCell 
  },
  { 
    id: "state", 
    accessorKey: "state", 
    header: "State", 
    cell: TextCell 
  },
  { 
    id: "city", 
    accessorKey: "city", 
    header: "City", 
    cell: TextCell 
  },
  { 
    id: "contactNumber", 
    accessorKey: "contactNumber", 
    header: "Contact", 
    cell: TextCell 
  },
  { 
    id: "branchEmail", 
    accessorKey: "branchEmail", 
    header: "Email", 
    cell: TextCell 
  },
  { 
    id: "branchManager", 
    accessorKey: "branchManager", 
    header: "Branch Manager", 
    cell: TextCell 
  },
  { 
    id: "areaManager", 
    accessorKey: "areaManager", 
    header: "Area Manager", 
    cell: TextCell 
  },
  { 
    id: "openingDate", 
    accessorKey: "openingDate", 
    header: "Opening Date", 
    cell: TextCell 
  },
  { 
    id: "workingHours", 
    accessorKey: "workingHours", 
    header: "Working Hours", 
    cell: TextCell 
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const isActive = row.original.status === "Active";
      
      const handleToggle = () => {
        // This calls the meta function we will set up in index.tsx
        (table.options.meta as any)?.toggleStatus?.(row.original);
      };

      return (
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
            isActive ? "bg-primary-500" : "bg-gray-300 dark:bg-dark-600"
          }`}
          title={`Mark as ${isActive ? "Inactive" : "Active"}`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-2" : "-translate-x-2"
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
    enableSorting: false 
  },
];

export const exportColumns: ExportColumn<Branch>[] = [
  { key: "branchCode", header: "Branch Code" },
  { key: "branchName", header: "Branch Name" },
  { key: "region", header: "Region" },
  { key: "country", header: "Country" },
  { key: "state", header: "State" },
  { key: "city", header: "City" },
  { key: "contactNumber", header: "Contact" },
  { key: "branchEmail", header: "Email" },
  { key: "branchManager", header: "Branch Manager" },
  { key: "areaManager", header: "Area Manager" },
  { key: "openingDate", header: "Opening Date" },
  { key: "workingHours", header: "Working Hours" },
  { key: "status", header: "Status" },
];