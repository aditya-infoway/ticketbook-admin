// Import Dependencies
import { ColumnDef } from "@tanstack/react-table";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import clsx from "clsx";

// Local Imports
import { Avatar, Badge, Button, Checkbox } from "@/components/ui";
import { Ticket, TicketPriority, TicketStatus } from "./data"; // 👈 Employee ki jagah Ticket import kiya

// ----------------------------------------------------------------------

export const ticketColumns: ColumnDef<Ticket>[] = [ // 👈 Naam ticketColumns kar diya
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "ticketId", // 👈 Ticket ID
    header: "Ticket ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        {row.original.ticketId}
      </span>
    ),
  },
  {
    accessorKey: "subject", // 👈 Subject
    header: "Subject",
    cell: ({ row }) => (
      <div className="max-w-[280px]">
        <p className="dark:text-dark-100 truncate text-sm font-medium text-gray-800">
          {row.original.subject}
        </p>
        <p className="dark:text-dark-300 text-[11px] text-gray-400">
          {row.original.createdAt}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "requestedBy", // 👈 Requested By
    header: "Requested By",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar
          size={7}
          src={row.original.requestedBy.avatar}
          name={row.original.requestedBy.name}
          initialColor="auto"
          classNames={{ display: "rounded-full" }}
        />
        <div className="flex flex-col">
          <span className="dark:text-dark-100 text-xs font-medium text-gray-800">
            {row.original.requestedBy.name}
          </span>
          <span className="dark:text-dark-400 text-[10px] text-gray-500">
            {row.original.requestedBy.department}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "priority", // 👈 Priority
    header: "Priority",
    cell: ({ getValue }) => {
      const priority = getValue<TicketPriority>();
      const color =
        priority === "critical" ? "error" :
        priority === "high" ? "warning" :
        priority === "medium" ? "info" : "neutral";

      return (
        <Badge variant="soft" color={color} className="h-5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status", // 👈 Status
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<TicketStatus>();
      
      const color =
        status === "open" ? "warning" :
        status === "in-progress" ? "primary" :
        status === "resolved" ? "success" : "neutral";

      const dotColor =
        status === "open" ? "bg-warning" :
        status === "in-progress" ? "bg-primary" :
        status === "resolved" ? "bg-success" : "bg-gray-400";

      return (
        <Badge
          variant="soft"
          color={color}
          className="h-5 gap-1.5 rounded-full text-tiny capitalize"
        >
          <span className={clsx("size-1.5 rounded-full", dotColor)} />
          {status.replace("-", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedTo", // 👈 Assignee
    header: "Assignee",
    cell: ({ getValue }) => (
      <span className="dark:text-dark-200 text-xs font-medium text-gray-700">
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row, table }) => (
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          as={Button}
          variant="flat"
          isIcon
          className="size-8 rounded-full"
        >
          <EllipsisHorizontalIcon className="size-5" />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <MenuItems className="dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center px-3 text-sm tracking-wide outline-hidden transition-colors",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )}
                  onClick={() => table.options.meta?.openEditDrawer?.(row.original)}
                >
                  View Details
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center px-3 text-sm tracking-wide outline-hidden transition-colors",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )}
                  onClick={() => console.log("Assign ticket", row.original)}
                >
                  Assign Ticket
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "text-error flex h-9 w-full items-center px-3 text-sm tracking-wide outline-hidden transition-colors",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )}
                  onClick={() => table.options.meta?.deleteRow?.(row)}
                >
                  Delete Ticket
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    ),
  },
];

// Export Columns (Excel/PDF ke liye)
export const exportColumns = [
  { header: "Ticket ID", accessor: "ticketId" },
  { header: "Subject", accessor: "subject" },
  { header: "Requested By", accessor: "requestedBy.name" },
  { header: "Department", accessor: "requestedBy.department" },
  { header: "Priority", accessor: "priority" },
  { header: "Status", accessor: "status" },
  { header: "Assignee", accessor: "assignedTo" },
];