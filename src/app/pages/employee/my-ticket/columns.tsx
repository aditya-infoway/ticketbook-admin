// src/app/pages/employee/my-ticket/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router"; // Or "react-router-dom" depending on your setup
import { EyeIcon } from "@heroicons/react/24/outline"; // Import an icon
import { TextCell } from "./shared/tableCells";
import { ExportColumn } from "./shared/export";
import type { CreateTicket } from "./shared/types";

export const columns: ColumnDef<CreateTicket>[] = [
  // Removed the 'select' checkbox column
  {
    id: "ticketNumber",
    accessorKey: "ticketNumber",
    header: "Ticket No.",
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
      const status = info.getValue<string>() || "Open";
      const colors: Record<string, string> = {
        Open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        "In Progress":
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        Assigned:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        "On Hold":
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        Reopened:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        Resolved:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        Closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || colors["Open"]}`}
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
    cell: ({ row }) => {
      return (
        // 👇 Changed to justify-start so it aligns to the left of its cell
        <div className="flex items-center justify-start">
          <Link
            to={`/employee/my-ticket/${row.original.id}`}
            className="text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center rounded-md p-1.5 transition-colors"
            title="View Details"
          >
            <EyeIcon className="size-5" />
          </Link>
        </div>
      );
    },

    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<CreateTicket>[] = [
  { key: "ticketNumber", header: "Ticket No." },
  { key: "subject", header: "Subject" },
  { key: "categoryName", header: "Category" },
  { key: "departmentName", header: "Department" },
  { key: "createdAt", header: "Created Date" },
  { key: "status", header: "Status" },
];
