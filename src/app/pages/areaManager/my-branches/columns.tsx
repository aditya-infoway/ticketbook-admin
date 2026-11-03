import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { EyeIcon } from "@heroicons/react/24/outline";
import { TextCell } from "./shared/tableCells";
import { ExportColumn } from "./shared/export";
import type { Branch } from "./shared/types";

export const columns: ColumnDef<Branch>[] = [
  {
    id: "srNo",
    header: "Sr. No.",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
    enableSorting: false,
    size: 70,
  },
  {
    id: "branchCode",
    accessorKey: "branchCode",
    header: "Branch Code",
    cell: ({ getValue }) => (
      <span className="text-primary-600 dark:text-primary-400 font-mono text-sm font-medium">
        {String(getValue() ?? "—")}
      </span>
    ),
  },
  {
    id: "branchName",
    accessorKey: "branchName",
    header: "Branch Name",
    cell: TextCell,
  },
  {
    id: "branchManager",
    accessorKey: "branchManager",
    header: "Branch Manager",
    cell: ({ getValue }) => {
      const name = String(getValue() ?? "—");
      return (
        <div className="flex items-center gap-2.5">
          <div className="from-primary-500 flex size-8 items-center justify-center rounded-full bg-gradient-to-br to-violet-600 text-xs font-semibold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {name}
          </span>
        </div>
      );
    },
  },
  {
    id: "contactNumber",
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <Link
          to={`/branch-master/${row.original.id}`}
          className="text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center rounded-md p-1.5 transition-colors"
          title="View Details"
        >
          <EyeIcon className="size-5" />
        </Link>
      </div>
    ),
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Branch>[] = [
  { key: "branchCode", header: "Branch Code" },
  { key: "branchName", header: "Branch Name" },
  { key: "branchManager", header: "Branch Manager" },
  { key: "contactNumber", header: "Contact Number" },
  { key: "city", header: "City" },
  { key: "state", header: "State" },
  { key: "status", header: "Status" },
];
