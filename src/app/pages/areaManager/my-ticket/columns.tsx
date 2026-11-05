// src/app/pages/area-manager/tickets/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
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
    id: "branchName",
    accessorKey: "branchName",
    header: "Branch",
    // 👇 Show Branch Name and Branch Code
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.branchName || "—"}
        </span>
        <span className="text-xs text-gray-500">
          {row.original.branchCode || ""}
        </span>
      </div>
    ),
  },
  {
    id: "employeeName",
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.employeeName || "—"}
        </span>
        <span className="text-xs text-gray-500">
          {row.original.employeeCode || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "contactNumber",
    accessorKey: "contactNumber",
    header: "Contact",
    cell: TextCell,
  },
  {
    id: "departmentName",
    accessorKey: "departmentName",
    header: "Department",
    cell: TextCell,
  },
  {
    id: "categoryName",
    accessorKey: "categoryName",
    header: "Category",
    cell: TextCell,
  },
  {
    id: "subject",
    accessorKey: "subject",
    header: "Subject",
    cell: TextCell,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created Date",
    // 👇 Format Date to DD-MM-YYYY
    cell: ({ row }) => {
      const rawDate = row.original.createdAt;
      if (!rawDate) return <span>—</span>;

      try {
        const dateObj = new Date(rawDate);
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = dateObj.getFullYear();

        // Optional: Time format
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";
        const formattedTime = `${dateObj.getHours() % 12 || 12}:${minutes} ${ampm}`;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {`${dd}-${mm}-${yyyy}`}
            </span>
            <span className="text-xs text-gray-500">{formattedTime}</span>
          </div>
        );
      } catch {
        return <span>{rawDate}</span>;
      }
    },
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
];

export const exportColumns: ExportColumn<CreateTicket>[] = [
  { key: "ticketNumber", header: "Ticket No." },
  { key: "branchName", header: "Branch" },
  { key: "employeeName", header: "Employee" },
  { key: "employeeCode", header: "Employee Code" },
  { key: "contactNumber", header: "Contact" },
  { key: "departmentName", header: "Department" },
  { key: "categoryName", header: "Category" },
  { key: "subject", header: "Subject" },
  { key: "createdAt", header: "Created Date" },
  { key: "status", header: "Status" },
];
