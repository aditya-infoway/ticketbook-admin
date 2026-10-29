import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { Branch } from "../shared/types";

const RowActions = createRowActions<Branch>("branch");

export const columns: ColumnDef<Branch>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "branchNo",
    accessorKey: "branchNo",
    header: "Branch ID",
    cell: TextCell,
  },
  {
    id: "branchName",
    accessorKey: "branchName",
    header: "Branch Name",
    cell: ({ row }) => {
      const photo = (row.original as any).profilePhoto as string | undefined;

      return (
        <div className="flex items-center gap-3">
          <div className="dark:bg-dark-700 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {photo ? (
              <img
                src={photo}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                {row.original.branchName?.charAt(0) || "B"}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.branchName}
            </span>
            <span className="text-xs text-gray-500">
              {row.original.branchCode}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "region",
    accessorKey: "region",
    header: "Region",
    cell: TextCell,
  },
  {
    id: "country",
    accessorKey: "country",
    header: "Country",
    cell: TextCell,
  },
  {
    id: "state",
    accessorKey: "state",
    header: "State",
    cell: TextCell,
  },
  {
    id: "city",
    accessorKey: "city",
    header: "City",
    cell: TextCell,
  },
  {
    id: "contactNumber",
    accessorKey: "contactNumber",
    header: "Contact",
    cell: TextCell,
  },
  {
    id: "branchEmail",
    accessorKey: "branchEmail",
    header: "Email",
    cell: TextCell,
  },
  {
    id: "branchManager",
    accessorKey: "branchManager",
    header: "Branch Manager",
    cell: TextCell,
  },
  {
    id: "areaManager",
    accessorKey: "areaManager",
    header: "Area Manager",
    cell: TextCell,
  },
  {
    id: "openingDate",
    accessorKey: "openingDate",
    header: "Opening Date",
    cell: TextCell,
  },
  {
    id: "workingHours",
    accessorKey: "workingHours",
    header: "Working Hours",
    cell: TextCell,
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
          className={`focus-visible:ring-primary-500 relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isActive ? "bg-primary-500" : "dark:bg-dark-600 bg-gray-300"
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
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Branch>[] = [
  { key: "branchNo", header: "Branch ID" },
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