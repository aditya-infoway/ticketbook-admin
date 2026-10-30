import { ColumnDef } from "@tanstack/react-table";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "./shared/tableCells";
import { ExportColumn } from "./shared/export";
import type { CreateTicket } from "./shared/types";

// Branch list me employee ki extra details bhi aati hain
export type BranchTicket = CreateTicket & {
  employeeName?: string;
  employeeCode?: string;
  branchName?: string;
  contactNumber?: string;
  issueDescription?: string;
  attachment?: string | null;
  statusId?: string;
};

// Row action: sirf Manage (details + status ek hi drawer me)
function BranchRowActions({ row, table }: any) {
  const meta = table.options.meta as any;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        title="View / Manage Status"
        onClick={() => meta?.openStatusDrawer?.(row.original)}
        className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <PencilSquareIcon className="size-5" />
      </button>
    </div>
  );
}

export const columns: ColumnDef<BranchTicket>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
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
    cell: BranchRowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<BranchTicket>[] = [
  { key: "ticketNumber", header: "Ticket No." },
  { key: "employeeName", header: "Employee" },
  { key: "subject", header: "Subject" },
  { key: "categoryName", header: "Category" },
  { key: "departmentName", header: "Department" },
  { key: "createdAt", header: "Created Date" },
  { key: "status", header: "Status" },
];