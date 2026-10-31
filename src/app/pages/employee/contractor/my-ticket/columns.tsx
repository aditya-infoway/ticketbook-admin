import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "@heroicons/react/24/outline";
import { TextCell } from "./shared/tableCells";
import { ExportColumn } from "./shared/export";
import type { CreateTicket } from "./shared/types";

export const columns: ColumnDef<CreateTicket>[] = [
  {
    id: "ticketNumber",
    accessorKey: "ticketNumber",
    header: "Ticket No.",
    cell: TextCell,
  },
  {
    id: "employeeName",
    accessorKey: "employeeName",
    header: "Employee",
    cell: TextCell,
  },
  {
    id: "subject",
    accessorKey: "subject",
    header: "Subject",
    cell: TextCell,
  },
  {
    id: "categoryName",
    accessorKey: "categoryName",
    header: "Category",
    cell: TextCell,
  },
  {
    id: "departmentName",
    accessorKey: "departmentName",
    header: "Department",
    cell: TextCell,
  },
  {
    id: "contractorName",
    accessorKey: "contractorName",
    header: "Contractor",
    cell: TextCell,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created Date",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (info) => {
      const status = info.getValue<string>() || "Assigned";
      const colors: Record<string, string> = {
        Assigned:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        "In Progress":
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        "On Hold":
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        "In Review":
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        Resolved:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        Closed:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            colors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row, table }) => {
      const ticket = row.original;
      return (
        <button
          type="button"
          onClick={() => (table.options.meta as any)?.viewRow?.(ticket)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-600"
          title="View / Update Status"
        >
          <EyeIcon className="size-4.5" />
        </button>
      );
    },
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<CreateTicket>[] = [
  { key: "ticketNumber", header: "Ticket No." },
  { key: "employeeName", header: "Employee" },
  { key: "subject", header: "Subject" },
  { key: "categoryName", header: "Category" },
  { key: "departmentName", header: "Department" },
  { key: "contractorName", header: "Contractor" },
  { key: "createdAt", header: "Created Date" },
  { key: "status", header: "Status" },
];