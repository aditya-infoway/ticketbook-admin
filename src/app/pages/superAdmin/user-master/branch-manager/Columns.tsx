import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { BranchManager } from "../shared/types";

const RowActions = createRowActions<BranchManager>("branch-manager");

export const columns: ColumnDef<BranchManager>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "branchManagerNo",
    accessorKey: "branchManagerNo",
    header: "Branch Manager Id",
    cell: TextCell,
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="dark:bg-dark-700 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100">
          {row.original.profilePhotoUrl ? (
            <img
              src={row.original.profilePhotoUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
              {row.original.name?.charAt(0) || "B"}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "mobileNumber",
    accessorKey: "mobileNumber",
    header: "Mobile",
    cell: TextCell,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
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
    id: "reportingTo",
    accessorKey: "reportingToName",
    header: "Reporting To",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const isActive = row.original.status === "Active";
      const handleToggle = () => {
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

export const exportColumns: ExportColumn<BranchManager>[] = [
  { key: "name", header: "Name" },
  { key: "mobileNumber", header: "Mobile" },
  { key: "email", header: "Email" },
  { key: "areaName", header: "Area" },
  { key: "branchName", header: "Branch" },
  { key: "reportingToName", header: "Reporting To" },
  { key: "status", header: "Status" },
];
