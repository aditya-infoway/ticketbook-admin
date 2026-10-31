import { ColumnDef } from "@tanstack/react-table";
import {
  PencilSquareIcon,
  UserPlusIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { CreateTicket } from "../shared/types";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// Branch list me employee ki extra details bhi aati hain
export type BranchTicket = CreateTicket & {
  employeeName?: string;
  employeeCode?: string;
  branchName?: string;
  contactNumber?: string;
  issueDescription?: string;
  attachment?: string | null;
  statusId?: string;
  isAssigned?: boolean;
  contractorName?: string;
  assignedAt?: string;
};

// Row action: ellipsis dropdown with Edit + Assign
function BranchRowActions({ row, table }: any) {
  const meta = table.options.meta as any;
  const isAssigned = !!row.original.isAssigned;
  const isStatusAssigned =
    String(row.original.status || "").toLowerCase() === "assigned";
  const canAssign = isStatusAssigned && !isAssigned;
  const assignHint = isAssigned
    ? "Already assigned"
    : !isStatusAssigned
      ? 'Set status to "Assigned" first (Edit)'
      : "Assign contractor";
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const toggleMenu = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate position (align right edge of menu with right edge of button)
      const menuWidth = 140; // approximate width (w-36 = 144px)
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - menuWidth,
      });
    }
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title="Actions"
        onClick={toggleMenu}
        className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <EllipsisHorizontalIcon className="size-5" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[100] w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Edit -> existing status drawer */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                meta?.openStatusDrawer?.(row.original);
              }}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <PencilSquareIcon className="size-4" />
              Edit
            </button>

            {/* Assign -> model not created yet, wire later */}
            {/* Assign: only after status = Assigned, and only once per ticket */}
            <button
              type="button"
              disabled={!canAssign}
              title={assignHint}
              onClick={() => {
                if (!canAssign) return;
                setOpen(false);
                meta?.openAssignDrawer?.(row.original);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                canAssign
                  ? "cursor-pointer text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  : "cursor-not-allowed text-gray-400 opacity-50 dark:text-gray-500"
              }`}
            >
              <UserPlusIcon className="size-4" />
              {isAssigned ? "Assigned" : "Assign"}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

export const columns: ColumnDef<BranchTicket>[] = [
  // ... (keep your other columns exactly the same)
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
    id: "contractorName",
    accessorKey: "contractorName",
    header: "Contractor",
    cell: (info) => info.getValue<string>() || "-",
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
  { key: "contractorName", header: "Contractor" },
];
